import DataPipeline from './DataPipeline';
import api, { NusApi } from '../services/nus-api';

import faculties from './fixtures/faculties.json';
import departments from './fixtures/departments.json';
import CS2100Timetable1 from './fixtures/api-timetable/CS2100_1.json';
import CS2100Timetable2 from './fixtures/api-timetable/CS2100_2.json';
import CS2100Expected from './fixtures/expected/CS2100.json';

import type { ModuleExam, ModuleInfo, TimetableLesson } from '../types/api';
import type { Module } from '../types/modules';

import { fromTermCode } from '../utils/api';
import { expectModulesEqual } from '../utils/test-utils';

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
      SubjectArea: 'CS',
      CatalogNumber: '2100',
      Title: 'Computer Organisation',
      OrganisationCode: '00301ACAD1',
      OrganisationName: '',
      AcademicGroup: '003',
      AcademicGroupDesc: '',
      WorkloadHoursNUSMods: '3-1-1-3-2',
      GradingBasisDesc: 'Graded',
      EffectiveDate: '2009-08-03',
      EduRecCourseID: '000479',
      CourseOfferNumber: '1',
      PreclusionSummary: 'CS1104 or Students from Department of ECE',
      PreclusionRule:
        'PROGRAM_TYPES IF_IN Undergraduate Degree\nTHEN\nPROGRAMS MUST_NOT_BE_IN (1) 0604CPEHON,0604ELEHON,2001CEGHON',
      AdditionalInformation: 'Some additional information',
      YearLong: 'N',
      CorequisiteSummary: '',
      CorequisiteRule: '',
      CourseDesc:
        'The objective of this module is to familiarise students with the fundamentals of computing devices. Through this module students will understand the basics of data representation, and how the various parts of a computer work, separately and with each other. This allows students to understand the issues in computing devices, and how these issues affect the implementation of solutions. Topics covered include data representation systems, combinational and sequential circuit design techniques, assembly language, processor execution cycles, pipelining, memory hierarchy and input/output systems.',
      CourseAttributes: [
        {
          Value: 'YES',
          Code: 'PRQN',
        },
      ],
      UnitsMin: 4,
      UnitsMax: 4,
      PrerequisiteSummary: 'CS1010 or its equivalent',
      PrerequisiteRule:
        'PROGRAM_TYPES IF_IN Undergraduate Degree\nTHEN\n(\n\tCOURSES (1) YSC1212:D,CS1010:D,CS1010J:D,CS1010E:D,CS1010S:D,CS1010FC:D,CS1010X:D,CS1101:D,CS1101S:D\n)',
      PreRequisiteAdvisory: '',
      Code: 'CS2100',
      ApplicableFromYear: '2018',
      ApplicableFromSem: '1',
    },
  ],
  '2': [
    {
      SubjectArea: 'CS',
      CatalogNumber: '2100',
      Title: 'Computer Organisation',
      OrganisationCode: '00301ACAD1',
      OrganisationName: '',
      AcademicGroup: '003',
      AcademicGroupDesc: '',
      WorkloadHoursNUSMods: '3-1-1-3-2',
      GradingBasisDesc: 'Graded',
      EffectiveDate: '2009-08-03',
      EduRecCourseID: '000479',
      CourseOfferNumber: '1',
      PreclusionSummary: 'CS1104 or Students from Department of ECE',
      PreclusionRule:
        'PROGRAM_TYPES IF_IN Undergraduate Degree\nTHEN\nPROGRAMS MUST_NOT_BE_IN (1) 0604CPEHON,0604ELEHON,2001CEGHON',
      AdditionalInformation: 'Some additional information',
      YearLong: 'N',
      CorequisiteSummary: '',
      CorequisiteRule: '',
      CourseDesc:
        'The objective of this module is to familiarise students with the fundamentals of computing devices. Through this module students will understand the basics of data representation, and how the various parts of a computer work, separately and with each other. This allows students to understand the issues in computing devices, and how these issues affect the implementation of solutions. Topics covered include data representation systems, combinational and sequential circuit design techniques, assembly language, processor execution cycles, pipelining, memory hierarchy and input/output systems.',
      CourseAttributes: [
        {
          Value: 'YES',
          Code: 'PRQN',
        },
      ],
      UnitsMin: 4,
      UnitsMax: 4,
      PrerequisiteSummary: 'CS1010 or its equivalent',
      PrerequisiteRule:
        'PROGRAM_TYPES IF_IN Undergraduate Degree\nTHEN\n(\n\tCOURSES (1) YSC1212:D,CS1010:D,CS1010J:D,CS1010E:D,CS1010S:D,CS1010FC:D,CS1010X:D,CS1101:D,CS1101S:D\n)',
      PreRequisiteAdvisory: '',
      Code: 'CS2100',
      ApplicableFromYear: '2018',
      ApplicableFromSem: '2',
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
    mockApi.getFacultyModules.mockImplementation(async (term: string, code: string) => {
      // 003 is Computing
      if (code !== '003') return [];
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

    expectModulesEqual(CS2100Actual, CS2100Expected as Module);
  });
});
