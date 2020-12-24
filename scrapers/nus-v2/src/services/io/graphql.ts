import { ClientError, gql, GraphQLClient } from 'graphql-request';

import config from '../../config';
import type { ModuleCode } from '../../types/modules';
import type { Persist } from '../../types/persist';
import { UnknownApiError } from '../../utils/errors';

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

  readonly #client: Promise<GraphQLClient>;

  constructor(academicYear: string) {
    if (!config.graphQLConfig) {
      throw new Error('graphQLConfig in config.json is not set');
    }

    const client = new GraphQLClient(config.graphQLConfig.url);
    client.setHeader('Authorization', config.graphQLConfig.token);
    this.#client = this.populateAdminInfo(client, academicYear);
  }

  // ///////////////////////////////////////////////////////////
  // Per year information
  // ///////////////////////////////////////////////////////////

  // Ignore since there's more detailed module info
  moduleList = () => Promise.resolve();
  moduleInfo = () => Promise.resolve();
  moduleInformation = () => Promise.resolve();
  moduleAliases = () => Promise.resolve();
  facultyDepartments = () => Promise.resolve();

  // ///////////////////////////////////////////////////////////
  // Per module information
  // ///////////////////////////////////////////////////////////

  module() {
    return Promise.resolve();
  }

  timetable() {
    return Promise.resolve();
  }

  semesterData() {
    return Promise.resolve();
  }

  async getModuleCodes() {
    const client = await this.#client;
    const data = await client.request<{
      node?: {
        courses?: {
          code?: string;
        }[];
      };
    }>(
      gql`
        query CourseCodes($acadYearId: ID!) {
          node(id: $acadYearId) {
            ... on AcadYear {
              courses {
                code
              }
            }
          }
        }
      `,
      { acadYearId: this.#acadYearId },
    );

    return (data.node?.courses ?? []).map((c) => c.code).filter((c) => c) as string[];
  }

  deleteModule = async (moduleCode: ModuleCode) => {
    const client = await this.#client;
    await client.request(
      gql`
        mutation DeleteCourse($acadYear: String, $moduleCode: String!) {
          deleteCourse(input: { code: $moduleCode }) {
            deletedCourseCode
          }
        }
      `,
      { moduleCode },
    );
  };

  // ///////////////////////////////////////////////////////////
  // Per semester information
  // ///////////////////////////////////////////////////////////

  // List of venues mapped to their availability
  venueInformation() {
    // TODO: Implement
    return Promise.resolve();
  }

  // List of venue codes used for searching
  // Ignore since venueInformation is more useful
  venueList = () => Promise.resolve();

  /**
   * Ensure that the school, the current AY, and all semesters are in the API.
   */
  private async populateAdminInfo(client: GraphQLClient, academicYear: string) {
    let existingAyData: {
      schoolWithShortName?: {
        id?: string;
        acadYearWithName?: {
          id?: string;
          semesters?: {
            id?: string;
            name?: string;
          }[];
        };
      };
    };
    try {
      existingAyData = await client.request(
        gql`
          query ay($schoolShortName: String!, $academicYear: String!) {
            schoolWithShortName(shortName: $schoolShortName) {
              id
              acadYearWithName(name: $academicYear) {
                id
                semesters {
                  id
                  name
                }
              }
            }
          }
        `,
        { schoolShortName, academicYear },
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
      schoolId = await this.createSchool(client);
    }
    if (!schoolId) {
      throw new UnknownApiError('Could not get or create school');
    }

    let ayId = existingAyData?.schoolWithShortName?.acadYearWithName?.id;
    if (!ayId) {
      ayId = await this.createAcadYear(client, schoolId, academicYear);
    }
    if (!ayId) {
      throw new UnknownApiError('Could not get or create acad year');
    }
    this.#acadYearId = ayId;

    const semesters = existingAyData?.schoolWithShortName?.acadYearWithName?.semesters;
    if (semesters) {
      semesters.forEach(({ id, name }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.#semesterIds[semesterNumbers[name as keyof typeof semesterNumbers]] = id!;
      });
    } else {
      await this.createSemesters(client);
    }

    return client;
  }

  private async createSchool(client: GraphQLClient): Promise<string | undefined> {
    const schoolData = await client.request<{
      createSchool?: {
        school?: {
          id?: string;
        };
      };
    }>(
      gql`
        mutation createSchool($input: CreateSchoolInput!) {
          createSchool(input: $input) {
            school {
              id
            }
          }
        }
      `,
      {
        input: {
          shortName: schoolShortName,
          // TODO: Move to config
          longName: 'National University of Singapore',
        },
      },
    );

    return schoolData.createSchool?.school?.id;
  }

  private async createAcadYear(
    client: GraphQLClient,
    schoolId: string,
    academicYear: string,
  ): Promise<string | undefined> {
    const newAyData = await client.request<{
      createAcadYear?: {
        acadYear?: {
          id?: string;
        };
      };
    }>(
      gql`
        mutation createAcadYear($input: CreateAcadYearInput!) {
          createAcadYear(input: $input) {
            acadYear {
              id
            }
          }
        }
      `,
      {
        input: {
          schoolId,
          name: academicYear,
        },
      },
    );

    return newAyData.createAcadYear?.acadYear?.id;
  }

  private async createSemesters(client: GraphQLClient) {
    // Use for loop so that we create semesters sequentially, so that semesters
    // have increasing IDs. While not strictly necessary, it just looks better
    // and is more intuitive.
    for (const [semester, name] of Object.entries(semesterNames)) {
      // eslint-disable-next-line no-await-in-loop
      const semData = await client.request<{
        createSemester?: {
          semester?: {
            id?: string;
            name?: string;
          };
        };
      }>(
        gql`
          mutation createSem($input: CreateSemesterInput!) {
            createSemester(input: $input) {
              semester {
                id
                name
              }
            }
          }
        `,
        {
          input: {
            acadYearId: this.#acadYearId,
            name,
          },
        },
      );

      const semId = semData.createSemester?.semester?.id;
      if (!semId) {
        throw new UnknownApiError(`Could not create semester ${semester} (${name})`);
      }
      this.#semesterIds[semester] = semId;
    }
  }
}
