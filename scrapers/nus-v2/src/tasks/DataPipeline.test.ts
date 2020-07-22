import DataPipeline from './DataPipeline';
import api, { NusApi } from '../services/nus-api';

import faculties from './fixtures/faculties.json';
import departments from './fixtures/departments.json';
import CS2100Timetable1 from './fixtures/api-timetable/CS2100_1.json';
import CS2100Timetable2 from './fixtures/api-timetable/CS2100_2.json';
import CS2100Expected from './fixtures/expected/CS2100.json';

import { fromTermCode } from '../utils/api';
import { expectModulesEqual } from '../utils/test-utils';
import { ModuleExam, ModuleInfo, TimetableLesson } from '../types/api';

jest.mock('../services/io/elastic');
jest.mock('../services/nus-api');
const mockApi: jest.Mocked<NusApi> = api as any;

/**
 * Full integration tests for the entire pipeline
 */

/* eslint-disable camelcase */

// Mock data for the module info API endpoint
const moduleInfoData: { [semester: string]: ModuleInfo[] } = {
  '1': [
    {
      Term: '1810',
      AcademicOrganisation: {
        Code: '00301ACAD1',
        Description: '',
      },
      WorkLoadHours: '3-1-1-3-2',
      EffectiveDate: '2009-08-03',
      CourseId: '000479',
      CourseOfferNumber: '1',
      Preclusion: 'CS1104 or Students from Department of ECE',
      AcademicGroup: {
        Code: '003',
        Description: '',
      },
      CourseTitle: 'Computer Organisation',
      PrintCatalog: 'Y',
      YearLong: 'N',
      CoRequisite: '',
      CatalogNumber: '2100',
      Description:
        'The objective of this module is to familiarise students with the fundamentals of computing devices. Through this module students will understand the basics of data representation, and how the various parts of a computer work, separately and with each other. This allows students to understand the issues in computing devices, and how these issues affect the implementation of solutions. Topics covered include data representation systems, combinational and sequential circuit design techniques, assembly language, processor execution cycles, pipelining, memory hierarchy and input/output systems.',
      ModuleAttributes: [
        {
          CourseAttributeValue: 'YES',
          CourseAttribute: 'PRQN',
        },
      ],
      ModularCredit: '4',
      PreRequisite: 'CS1010 or its equivalent',
      Subject: 'CS',
    },
  ],
  '2': [
    {
      Term: '1820',
      AcademicOrganisation: {
        Code: '00301ACAD1',
        Description: '',
      },
      WorkLoadHours: '3-1-1-3-2',
      EffectiveDate: '2009-08-03',
      CourseId: '000479',
      CourseOfferNumber: '1',
      Preclusion: 'CS1104 or Students from Department of ECE',
      AcademicGroup: {
        Code: '003',
        Description: '',
      },
      CourseTitle: 'Computer Organisation',
      PrintCatalog: 'Y',
      YearLong: 'N',
      CoRequisite: '',
      CatalogNumber: '2100',
      Description:
        'The objective of this module is to familiarise students with the fundamentals of computing devices. Through this module students will understand the basics of data representation, and how the various parts of a computer work, separately and with each other. This allows students to understand the issues in computing devices, and how these issues affect the implementation of solutions. Topics covered include data representation systems, combinational and sequential circuit design techniques, assembly language, processor execution cycles, pipelining, memory hierarchy and input/output systems.',
      ModuleAttributes: [
        {
          CourseAttributeValue: 'YES',
          CourseAttribute: 'PRQN',
        },
      ],
      ModularCredit: '4',
      PreRequisite: 'CS1010 or its equivalent',
      Subject: 'CS',
    },
  ],
};

const moduleExamData: Record<string, ModuleExam[]> = {
  '1': [
    {
      term: '1810',
      start_time: '17:00',
      acad_org: '00301ACAD1',
      module: 'CS2100',
      end_time: '19:00',
      duration: 120,
      exam_date: '2018-11-27',
    },
  ],
  '2': [
    {
      term: '1820',
      start_time: '17:00',
      acad_org: '00301ACAD1',
      module: 'CS2100',
      end_time: '19:00',
      duration: 120,
      exam_date: '2019-05-02',
    },
  ],
};

const moduleTimetableData: { [semester: string]: TimetableLesson[] } = {
  '1': CS2100Timetable1,
  '2': CS2100Timetable2,
};

describe(DataPipeline, () => {
  test('everything works', async () => {
    // Setup code to mock all used API endpoints
    mockApi.getFaculty.mockResolvedValue(faculties);
    mockApi.getDepartment.mockResolvedValue(departments);
    mockApi.getDepartmentModules.mockImplementation(async (term: string, code: string) => {
      // 00301ACAD1 is Computer Science
      if (code !== '00301ACAD1') return [];
      const [, semester] = fromTermCode(term);
      return moduleInfoData[semester] || [];
    });
    mockApi.getSemesterTimetables.mockImplementation(async (term, consumer) => {
      const [, semester] = fromTermCode(term);
      const lessons = moduleTimetableData[semester] || [];
      lessons.forEach((lesson) => consumer(lesson));
    });

    mockApi.getTermExams.mockImplementation(async (term) => {
      const [, semester] = fromTermCode(term);
      return moduleExamData[semester] || [];
    });

    const pipeline = new DataPipeline();
    // Mock getModuleCodes since we've mocked fs-extra
    pipeline.io.getModuleCodes = () => Promise.resolve([]);

    const [CS2100Actual] = await pipeline.run();

    expectModulesEqual(CS2100Actual, CS2100Expected);
  });
});
