import { ClientError } from 'graphql-request';
import { groupBy } from 'lodash';

import logger from '../logger';
import type { LessonTime, Module, ModuleCode, RawLesson } from '../../types/modules';
import type { Persist } from '../../types/persist';
import { NUSModsApiError } from '../../utils/errors';
import { clientForAcadYear, NUSModsAPIClient } from '../nusmods-api';
import {
  UpsertCourseCourseOfferingLessonGroupInput,
  Day,
  Scalars,
  UpsertCourseInput,
} from '../nusmods-api/__generated__/client';

function lessonTimeToGraphQLTime(time: LessonTime): Scalars['Time'] {
  const hour = time.substring(0, 2);
  const minute = time.substring(2);
  return `${hour}:${minute}:00`;
}

// TODO: Tests
function timetableToLessonGroups(
  timetable: RawLesson[],
): UpsertCourseCourseOfferingLessonGroupInput[] {
  // TODO:
  const groupedLessons = groupBy(timetable, (lesson) => lesson.lessonType + lesson.classNo);
  return Object.values(groupedLessons).map((lessons) => ({
    // type and number are guaranteed to exist since we grouped by them
    type: lessons[0].lessonType,
    number: lessons[0].classNo,

    lessons: lessons.map((lesson) => ({
      day: Day[lesson.day as never], // Cast to `never` because we don't really know if lesson.day is a `keyof typeof Day`.
      startTime: lessonTimeToGraphQLTime(lesson.startTime),
      endTime: lessonTimeToGraphQLTime(lesson.endTime),
      weekString: '', // TODO:
      // weekString: lesson.weeks, // TODO: Turn into array of weeks?
      size: lesson.size,
      // TODO: covidZone
    })),
  }));
}

function moduleToCourseInput(api: NUSModsAPIClient, module: Module): UpsertCourseInput {
  return {
    acadYearId: api.acadYearId,
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
      semesterId: api.semesterIds[semesterData.semester],
      // TODO: faculty: module.faculty,
      department: module.department,
      // workloadString: module.workload, // TODO: Convert back to workload list? Or have a workload array? I think we should just make a list
      exam:
        semesterData.examDate && semesterData.examDuration
          ? {
              date: semesterData.examDate,
              duration: semesterData.examDuration,
            }
          : null,
      lessonGroups: timetableToLessonGroups(semesterData.timetable),
    })),
  };
}

/* eslint-disable class-methods-use-this */
export default class GraphQLPersist implements Persist {
  /**
   * NUSMods GraphQL server client.
   */
  readonly #nusmodsApi: Promise<NUSModsAPIClient>;

  constructor(academicYear: string) {
    this.#nusmodsApi = clientForAcadYear(academicYear);
  }

  // ///////////////////////////////////////////////////////////
  // Per year information
  // ///////////////////////////////////////////////////////////

  // Don't use these since `module` method gets more detailed info
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
    const api = await this.#nusmodsApi;
    try {
      await api.callApi((gql) =>
        gql.UpsertCourse({
          input: moduleToCourseInput(api, module),
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
    const api = await this.#nusmodsApi;
    const data = await api.callApi((gql) =>
      gql.QueryCourseCodes({
        acadYearId: api.acadYearId,
      }),
    );
    const ay = data.node;
    // eslint-disable-next-line no-underscore-dangle
    if (ay?.__typename !== 'AcadYear') {
      throw new NUSModsApiError('Received AY was not an acad year.');
    }
    return (ay.courses ?? []).map((c) => c?.code).filter((c) => c) as string[];
  }

  deleteModule = async (moduleCode: ModuleCode) => {
    const api = await this.#nusmodsApi;
    await api.callApi((gql) =>
      gql.DeleteCourse({
        input: {
          acadYearId: api.acadYearId,
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

  // Don't use this since `venueInformation` gets more detailed info
  venueList = () => Promise.resolve();
}
