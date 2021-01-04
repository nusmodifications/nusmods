import { ClientError, GraphQLClient } from 'graphql-request';
import Queue from 'promise-queue';

import config from '../../config';
import { NUSModsApiError } from '../../utils/errors';
import { getSdk, Sdk, QueryAdminInfoQuery } from './__generated__/client';

export type NUSModsAPIClient = {
  /**
   * Map of semester numbers (i.e. 1, 2, 3, 4) to `Semester` node `ID`s on the
   * server.
   */
  semesterIds: { [key: string]: string };
  /**
   * The `AcadYear` node `ID` on the server.
   */
  acadYearId: string;
  /**
   * Wrapper around an API client that pushes the call into a queue.
   */
  callApi<T>(caller: (gql: Sdk) => Promise<T>): Promise<T>;
};

// TODO: Move to config
const schoolShortName = 'NUS';

// TODO: Move to nusmoderator? Move the one in website's app-config as well
const semesterNames = {
  '1': 'Semester 1',
  '2': 'Semester 2',
  '3': 'Special Term I',
  '4': 'Special Term II',
};
const semesterNumbers = {
  'Semester 1': '1',
  'Semester 2': '2',
  'Special Term I': '3',
  'Special Term II': '4',
};

/**
 * Get or create school, the current AY, and all semesters, before resolving to
 * an API client.
 */
async function clientAfterPopulatingAdminInfo(
  gql: Sdk,
  academicYear: string,
  queue: Queue,
): Promise<NUSModsAPIClient> {
  // 1. Get existing data
  let existingAyData: QueryAdminInfoQuery;
  try {
    existingAyData = await queue.add(() =>
      gql.QueryAdminInfo({
        schoolShortName,
        academicYear,
      }),
    );
  } catch (e) {
    if (e instanceof ClientError && e.response.errors?.[0]?.message.endsWith('not found')) {
      // Errors received are * not found errors. We'll create whatever we
      // need, so we'll just pretend there were no errors and continue.
      existingAyData = e.response.data;
    } else {
      throw e;
    }
  }

  // 2. Get or create school
  let schoolId = existingAyData?.schoolWithShortName?.id;
  if (!schoolId) {
    const schoolData = await queue.add(() =>
      gql.CreateSchool({
        input: {
          shortName: schoolShortName,
          // TODO: Move to config
          longName: 'National University of Singapore',
        },
      }),
    );
    schoolId = schoolData.createSchool?.school?.id;
  }
  if (!schoolId) {
    throw new NUSModsApiError('Could not get or create school');
  }

  // 2. Get or create acad year
  let acadYearId = existingAyData?.schoolWithShortName?.acadYearWithName?.id;
  if (!acadYearId) {
    const newAyData = await queue.add(() =>
      gql.CreateAcadYear({
        input: {
          name: academicYear,
          // We already checked
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          schoolId: schoolId!,
        },
      }),
    );
    acadYearId = newAyData.createAcadYear?.acadYear?.id;
  }
  if (!acadYearId) {
    throw new NUSModsApiError('Could not get or create acad year');
  }

  // 2. Get or create all semesters for acad year
  const semesterIds: NUSModsAPIClient['semesterIds'] = {};
  const semesters = existingAyData?.schoolWithShortName?.acadYearWithName?.semesters;
  if (semesters) {
    semesters.forEach((semester) => {
      if (!semester) {
        // This should never happen, so we just throw and fix manually by
        // manually adding the missing semeseter.
        throw new NUSModsApiError('Academic year has a missing semester!');
      }
      const { name, id } = semester;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      semesterIds[semesterNumbers[name as keyof typeof semesterNumbers]] = id!;
    });
  } else {
    // Use for loop so that we create semesters sequentially, so that semesters
    // have increasing IDs. While not strictly necessary, it just looks better
    // and is more intuitive.
    for (const [semester, name] of Object.entries(semesterNames)) {
      // eslint-disable-next-line no-await-in-loop
      const semData = await queue.add(() =>
        gql.CreateSemester({
          input: {
            name,
            // We already checked
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            acadYearId: acadYearId!,
          },
        }),
      );
      const semId = semData.createSemester?.semester?.id;
      if (!semId) {
        throw new NUSModsApiError(`Could not create semester ${semester} (${name})`);
      }
      semesterIds[semester] = semId;
    }
  }

  return {
    acadYearId,
    semesterIds,
    callApi<T>(caller: (sdk: Sdk) => Promise<T>): Promise<T> {
      return queue.add(() => caller(gql));
    },
  };
}

/**
 * Singleton clients for each `acadYear`.
 * @see clientForAcadYear
 */
const clients: { [acadYear: string]: Promise<NUSModsAPIClient> } = {};

/**
 * Returns a promise that resolves to a fully populated API client.
 *
 * This client is a global singleton (though keyed by `academicYear`) so that
 * the app only sets up the API server (i.e. school, AY, sem records on the
 * server) once, and also shares the same operation queue.
 */
export function clientForAcadYear(academicYear: string): Promise<NUSModsAPIClient> {
  if (academicYear in clients) {
    return clients[academicYear];
  }

  if (!config.graphQLConfig) {
    throw new Error('graphQLConfig in config.json is not set');
  }

  /**
   * Promise queue used to limit concurrent calls to the NUSMods GraphQL API
   * server.
   */
  const queue = new Queue(config.graphQLConfig.concurrency);

  const client = new GraphQLClient(config.graphQLConfig.url);
  client.setHeader('Authorization', config.graphQLConfig.token);
  const sdk = getSdk(client);

  clients[academicYear] = clientAfterPopulatingAdminInfo(sdk, academicYear, queue);
  return clients[academicYear];
}
