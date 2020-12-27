import { ClientError, GraphQLClient } from 'graphql-request';
import { groupBy } from 'lodash';
import Queue from 'promise-queue';

import config from '../../config';
import logger from '../logger';
import type { Module, ModuleCode, RawLesson } from '../../types/modules';
import type { Persist } from '../../types/persist';
import { NUSModsApiError } from '../../utils/errors';
import {
  getSdk,
  Sdk,
  QueryAdminInfoQuery,
  UpsertCourseCourseOfferingLessonGroupInput,
  Day,
} from '../nusmods-api';

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

// TODO: Move into tasks?
// TODO: Tests
function timetableToLessonGroups(
  timetable: RawLesson[],
): UpsertCourseCourseOfferingLessonGroupInput[] {
  // TODO:
  const groupedLessons = groupBy(timetable, (lesson) => lesson.lessonType + lesson.classNo);
  return Object.entries(groupedLessons).map(([, lessons]) => ({
    // type and number are guaranteed to exist since we grouped by them
    type: lessons[0].lessonType,
    number: lessons[0].classNo,

    lessons: lessons.map((lesson) => {
      return {
        day: Day[lesson.day as never], // Cast to `never` because we don't really know if lesson.day is a `keyof typeof Day`.
        // TODO: Ensure server strips date from Time
        startTime: lesson.startTime, // TODO: Do we need to manually convert?
        endTime: lesson.endTime, // TODO: Do we need to manually convert?
        weekString: '', // TODO:
        // weekString: lesson.weeks, // TODO: Turn into array of weeks?
        size: lesson.size,
        // TODO: covidZone
      };
    }),
  }));
}

/* eslint-disable class-methods-use-this */
export default class GraphQLPersist implements Persist {
  /**
   * Map of semester numbers (i.e. 1, 2, 3, 4) to `Semester` node `ID`s on the
   * server.
   */
  #semesterIds: { [key: string]: string } = {};
  /**
   * The `AcadYear` node `ID` on the server.
   */
  #acadYearId = '';

  /**
   * NUSMods GraphQL server client. Not meant to be used directly; use
   * `callApi` instead.
   * @see callApi
   */
  readonly #nusmodsGraphqlServer: Promise<Sdk>;

  /**
   * Promise queue used to limit concurrent calls to the NUSMods GraphQL API
   * server. Not meant to be used directly; use `callApi` instead.
   * @see callApi
   */
  readonly #queue: Queue;

  /**
   * Wrapper around #nusmodsGraphqlServer and #queue that pushes the call into
   * a queue.
   */
  private async callApi<T>(caller: (gql: Sdk) => Promise<T>): Promise<T> {
    const gql = await this.#nusmodsGraphqlServer;
    return this.#queue.add(() => caller(gql));
  }

  constructor(academicYear: string) {
    if (!config.graphQLConfig) {
      throw new Error('graphQLConfig in config.json is not set');
    }

    this.#queue = new Queue(config.graphQLConfig.concurrency);

    const client = new GraphQLClient(config.graphQLConfig.url);
    client.setHeader('Authorization', config.graphQLConfig.token);
    const sdk = getSdk(client);
    this.#nusmodsGraphqlServer = this.populateAdminInfo(sdk, academicYear);
  }

  // ///////////////////////////////////////////////////////////
  // Per year information
  // ///////////////////////////////////////////////////////////

  // Ignore since `module` method gets more detailed info
  moduleList = () => Promise.resolve();
  moduleInfo = () => Promise.resolve();

  // Not used by /website
  moduleInformation = () => Promise.resolve();
  moduleAliases = () => Promise.resolve();
  facultyDepartments = () => Promise.resolve();

  // ///////////////////////////////////////////////////////////
  // Per module information
  // ///////////////////////////////////////////////////////////

  async module(_moduleCode: ModuleCode, module: Module) {
    try {
      await this.callApi((gql) =>
        // Sync course
        gql.UpsertCourse({
          input: {
            acadYearId: this.#acadYearId,
            // Basic info
            code: module.moduleCode,
            title: module.title,

            // Additional info
            description: module.description ?? '', // TODO: Make optional on server
            credit: module.moduleCredit,
            // TODO: aliases
            // TODO: attributes

            // Requisites
            prerequisiteString: module.prerequisite,
            corequisiteString: module.corequisite,
            preclusionString: module.preclusion,

            // TODO: Requisite tree?

            // Semester data
            courseOfferings: module.semesterData.map((semesterData) => ({
              semesterId: this.#semesterIds[semesterData.semester],
              // TODO: faculty: module.faculty,
              department: module.department,
              // workloadString: module.workload, // TODO: Convert back to workload list? Or have a workload array? I think we should just make a list
              exam: semesterData.examDate
                ? {
                    time: semesterData.examDate,
                    duration: semesterData.examDuration,
                  }
                : null,
              lessonGroups: timetableToLessonGroups(semesterData.timetable),
            })),
          },
        }),
      );
    } catch (err) {
      if (err instanceof ClientError) {
        logger.error(
          {
            moduleCode: module.moduleCode,
            err,
            graphQLResponse: err.response,
          },
          'GraphQL error while upserting course',
        );
        return;
      }
      throw new NUSModsApiError(`Unknown error while upserting module ${module.moduleCode}`, err);
    }
  }

  async getModuleCodes() {
    const data = await this.callApi((gql) =>
      gql.QueryCourseCodes({
        acadYearId: this.#acadYearId,
      }),
    );
    const ay = data.node;
    if (ay?.__typename !== 'AcadYear') {
      throw new NUSModsApiError('Received AY was not an acad year.');
    }
    return (ay.courses ?? []).map((c) => c?.code).filter((c) => c) as string[];
  }

  deleteModule = async (moduleCode: ModuleCode) => {
    await this.callApi((gql) =>
      gql.DeleteCourse({
        input: {
          acadYearId: this.#acadYearId,
          code: moduleCode,
        },
      }),
    );
  };

  // Not used by /website
  timetable = () => Promise.resolve();
  semesterData = () => Promise.resolve();

  // ///////////////////////////////////////////////////////////
  // Per semester information
  // ///////////////////////////////////////////////////////////

  // List of venues mapped to their availability
  venueInformation() {
    // TODO: Implement
    return Promise.resolve();
  }

  // Ignore since `venueInformation` gets more detailed info
  venueList = () => Promise.resolve();

  // ///////////////////////////////////////////////////////////
  // Initialization
  // ///////////////////////////////////////////////////////////

  /**
   * Ensure that the school, the current AY, and all semesters are in the API.
   */
  private async populateAdminInfo(gql: Sdk, academicYear: string) {
    let existingAyData: QueryAdminInfoQuery;
    try {
      existingAyData = await this.#queue.add(() =>
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

    let schoolId = existingAyData?.schoolWithShortName?.id;
    if (!schoolId) {
      schoolId = await this.createSchool(gql);
    }
    if (!schoolId) {
      throw new NUSModsApiError('Could not get or create school');
    }

    let ayId = existingAyData?.schoolWithShortName?.acadYearWithName?.id;
    if (!ayId) {
      ayId = await this.createAcadYear(gql, schoolId, academicYear);
    }
    if (!ayId) {
      throw new NUSModsApiError('Could not get or create acad year');
    }
    this.#acadYearId = ayId;

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
        this.#semesterIds[semesterNumbers[name as keyof typeof semesterNumbers]] = id!;
      });
    } else {
      await this.createSemesters(gql);
    }

    return gql;
  }

  private async createSchool(gql: Sdk): Promise<string | undefined> {
    const schoolData = await this.#queue.add(() =>
      gql.CreateSchool({
        input: {
          shortName: schoolShortName,
          // TODO: Move to config
          longName: 'National University of Singapore',
        },
      }),
    );
    return schoolData.createSchool?.school?.id;
  }

  private async createAcadYear(
    gql: Sdk,
    schoolId: string,
    academicYear: string,
  ): Promise<string | undefined> {
    const newAyData = await this.#queue.add(() =>
      gql.CreateAcadYear({
        input: {
          schoolId,
          name: academicYear,
        },
      }),
    );
    return newAyData.createAcadYear?.acadYear?.id;
  }

  private async createSemesters(gql: Sdk) {
    // Use for loop so that we create semesters sequentially, so that semesters
    // have increasing IDs. While not strictly necessary, it just looks better
    // and is more intuitive.
    for (const [semester, name] of Object.entries(semesterNames)) {
      // eslint-disable-next-line no-await-in-loop
      const semData = await this.#queue.add(() =>
        gql.CreateSemester({
          input: {
            acadYearId: this.#acadYearId,
            name,
          },
        }),
      );
      const semId = semData.createSemester?.semester?.id;
      if (!semId) {
        throw new NUSModsApiError(`Could not create semester ${semester} (${name})`);
      }
      this.#semesterIds[semester] = semId;
    }
  }
}
