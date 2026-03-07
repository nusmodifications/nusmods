import type { Mocked } from 'vitest';
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

vi.mock('../services/io/elastic');
vi.mock('../services/nus-api');
const mockApi: Mocked<NusApi> = api as any;

/**
 * Full integration tests for the entire pipeline
 */

// Mock data for the module info API endpoint
const moduleInfoData: { [semester: string]: Array<ModuleInfo> } = {
  '1': [
    {
      AcademicGroup: '003',
      AcademicGroupDesc: '',
      AdditionalInformation: 'Some additional information',
      ApplicableFromSem: '1',
      ApplicableFromYear: '2018',
      CatalogNumber: '2100',
      Code: 'CS2100',
      CorequisiteRule: '',
      CorequisiteSummary: '',
      CourseAttributes: [
        {
          Code: 'PRQN',
          Value: 'YES',
        },
      ],
      CourseDesc:
        'The objective of this module is to familiarise students with the fundamentals of computing devices. Through this module students will understand the basics of data representation, and how the various parts of a computer work, separately and with each other. This allows students to understand the issues in computing devices, and how these issues affect the implementation of solutions. Topics covered include data representation systems, combinational and sequential circuit design techniques, assembly language, processor execution cycles, pipelining, memory hierarchy and input/output systems.',
      CourseOfferNumber: '1',
      EduRecCourseID: '000479',
      EffectiveDate: '2009-08-03',
      GradingBasisDesc: 'Graded',
      OrganisationCode: '00301ACAD1',
      OrganisationName: '',
      PreclusionRule:
        'PROGRAM_TYPES IF_IN Undergraduate Degree\nTHEN\nPROGRAMS MUST_NOT_BE_IN (1) 0604CPEHON,0604ELEHON,2001CEGHON',
      PreclusionSummary: 'CS1104 or Students from Department of ECE',
      PreRequisiteAdvisory: '',
      PrerequisiteRule:
        'PROGRAM_TYPES IF_IN Undergraduate Degree\nTHEN\n(\n\tCOURSES (1) YSC1212:D,CS1010:D,CS1010J:D,CS1010E:D,CS1010S:D,CS1010FC:D,CS1010X:D,CS1101:D,CS1101S:D\n)',
      PrerequisiteSummary: 'CS1010 or its equivalent',
      SubjectArea: 'CS',
      Title: 'Computer Organisation',
      UnitsMax: 4,
      UnitsMin: 4,
      WorkloadHoursNUSMods: '3-1-1-3-2',
      YearLong: 'N',
    },
  ],
  '2': [
    {
      AcademicGroup: '003',
      AcademicGroupDesc: '',
      AdditionalInformation: 'Some additional information',
      ApplicableFromSem: '2',
      ApplicableFromYear: '2018',
      CatalogNumber: '2100',
      Code: 'CS2100',
      CorequisiteRule: '',
      CorequisiteSummary: '',
      CourseAttributes: [
        {
          Code: 'PRQN',
          Value: 'YES',
        },
      ],
      CourseDesc:
        'The objective of this module is to familiarise students with the fundamentals of computing devices. Through this module students will understand the basics of data representation, and how the various parts of a computer work, separately and with each other. This allows students to understand the issues in computing devices, and how these issues affect the implementation of solutions. Topics covered include data representation systems, combinational and sequential circuit design techniques, assembly language, processor execution cycles, pipelining, memory hierarchy and input/output systems.',
      CourseOfferNumber: '1',
      EduRecCourseID: '000479',
      EffectiveDate: '2009-08-03',
      GradingBasisDesc: 'Graded',
      OrganisationCode: '00301ACAD1',
      OrganisationName: '',
      PreclusionRule:
        'PROGRAM_TYPES IF_IN Undergraduate Degree\nTHEN\nPROGRAMS MUST_NOT_BE_IN (1) 0604CPEHON,0604ELEHON,2001CEGHON',
      PreclusionSummary: 'CS1104 or Students from Department of ECE',
      PreRequisiteAdvisory: '',
      PrerequisiteRule:
        'PROGRAM_TYPES IF_IN Undergraduate Degree\nTHEN\n(\n\tCOURSES (1) YSC1212:D,CS1010:D,CS1010J:D,CS1010E:D,CS1010S:D,CS1010FC:D,CS1010X:D,CS1101:D,CS1101S:D\n)',
      PrerequisiteSummary: 'CS1010 or its equivalent',
      SubjectArea: 'CS',
      Title: 'Computer Organisation',
      UnitsMax: 4,
      UnitsMin: 4,
      WorkloadHoursNUSMods: '3-1-1-3-2',
      YearLong: 'N',
    },
  ],
};

const moduleExamData: Record<string, Array<ModuleExam>> = {
  '1': [
    {
      acad_org: '00301ACAD1',
      duration: 120,
      end_time: '19:00',
      exam_date: '2018-11-27',
      module: 'CS2100',
      start_time: '17:00',
      term: '1810',
    },
  ],
  '2': [
    {
      acad_org: '00301ACAD1',
      duration: 120,
      end_time: '19:00',
      exam_date: '2019-05-02',
      module: 'CS2100',
      start_time: '17:00',
      term: '1820',
    },
  ],
};

const moduleTimetableData: { [semester: string]: Array<TimetableLesson> } = {
  '1': CS2100Timetable1,
  '2': CS2100Timetable2,
};

describe(DataPipeline, () => {
  test('everything works', async () => {
    // Setup code to mock all used API endpoints
    mockApi.getFaculty.mockResolvedValue(faculties);
    mockApi.getDepartment.mockResolvedValue(departments);
    // GetAllModules first tries the year-only endpoint; return the union
    // of all semesters' module data (deduplicated by GetAllModules)
    mockApi.getFacultyModulesForYear.mockImplementation(async (_year: string, code: string) => {
      if (code !== '003') {
        return [];
      }
      // Return modules from all semesters - GetAllModules will deduplicate
      return [...(moduleInfoData['1'] || []), ...(moduleInfoData['2'] || [])];
    });
    // Keep per-semester mock for the fallback path
    mockApi.getFacultyModules.mockImplementation(async (term: string, code: string) => {
      // 003 is Computing
      if (code !== '003') {
        return [];
      }
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
