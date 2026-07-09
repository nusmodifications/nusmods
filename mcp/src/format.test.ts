import { describe, expect, it } from 'vitest';
import type { ModuleHit } from './data/elastic.js';
import { formatModuleSummary, formatSearchResults } from './format.js';
import type { Module, ModuleInformation } from './types/modules.js';

const module: Module = {
  acadYear: '2026/2027',
  moduleCode: 'CS2030S',
  title: 'Programming Methodology II',
  description: 'A module about OOP and FP.',
  moduleCredit: '4',
  department: 'Computer Science',
  faculty: 'Computing',
  workload: [2, 1, 2, 3, 2],
  gradingBasisDescription: 'Graded',
  prerequisite: 'CS1010',
  preclusion: 'CS2030',
  semesterData: [
    { semester: 1, timetable: [], examDate: '2026-11-25T13:00:00.000+08:00', examDuration: 120 },
    { semester: 2, timetable: [] },
  ],
  timestamp: 0,
};

describe('formatModuleSummary', () => {
  const summary = formatModuleSummary(module);

  it('includes the heading, credits, faculty and department', () => {
    expect(summary).toContain('# CS2030S Programming Methodology II');
    expect(summary).toContain('**Module credits:** 4');
    expect(summary).toContain('**Faculty:** Computing');
    expect(summary).toContain('**Department:** Computer Science');
  });

  it('lists the semesters the module is offered in', () => {
    expect(summary).toContain('**Offered in:** Semester 1, Semester 2');
  });

  it('formats a numeric workload tuple into labelled hours', () => {
    expect(summary).toContain(
      '**Workload:** Lecture: 2h, Tutorial: 1h, Laboratory: 2h, Project: 3h, Preparation: 2h',
    );
  });

  it('keeps a string workload verbatim', () => {
    const withStringWorkload = formatModuleSummary({
      ...module,
      workload: 'About 10 hours a week',
    });
    expect(withStringWorkload).toContain('**Workload:** About 10 hours a week');
  });

  it('renders requisites and the exam line for semesters that have an exam', () => {
    expect(summary).toContain('**Prerequisite:** CS1010');
    expect(summary).toContain('**Preclusion:** CS2030');
    expect(summary).toContain('**Semester 1 exam:** 2026-11-25T13:00:00.000+08:00 (120 min)');
    expect(summary).not.toContain('**Semester 2 exam:**');
  });

  it('includes the description', () => {
    expect(summary).toContain('A module about OOP and FP.');
  });
});

function makeHit(
  source: Partial<ModuleInformation>,
  highlight?: ModuleHit['highlight'],
): ModuleHit {
  return {
    _id: source.moduleCode ?? 'X',
    _index: 'modules_v2',
    _score: 1,
    _source: {
      moduleCode: 'CS0000',
      title: 'Test',
      moduleCredit: '4',
      department: 'D',
      faculty: 'F',
      semesterData: [],
      ...source,
    },
    highlight,
  };
}

describe('formatSearchResults', () => {
  it('reports an empty result set with the query and filters', () => {
    const text = formatSearchResults('foo', 0, [], 'semesters: 1');
    expect(text).toContain('No modules found matching "foo" [semesters: 1]');
  });

  it('builds a header with the match count, query and applied filters', () => {
    const hits = [makeHit({ moduleCode: 'CS3244', title: 'Machine Learning' })];
    const text = formatSearchResults('learning', 12, hits, 'levels: 3000');

    expect(text).toContain('Found 12 module(s) matching "learning" [levels: 3000] (showing 1)');
    expect(text).toContain('- **CS3244** Machine Learning · 4 MC');
  });

  it('converts highlight <mark> tags to markdown bold', () => {
    const hits = [
      makeHit(
        { moduleCode: 'CS3244', title: 'Machine Learning' },
        { description: ['intro to <mark>learning</mark> systems'] },
      ),
    ];
    const text = formatSearchResults('learning', 1, hits);

    expect(text).toContain('intro to **learning** systems');
    expect(text).not.toContain('<mark>');
  });

  it('falls back to a truncated description snippet without a highlight', () => {
    const longDescription = 'x'.repeat(200);
    const hits = [makeHit({ moduleCode: 'CS1000', description: longDescription })];
    const text = formatSearchResults(undefined, 1, hits);

    expect(text).toContain(`${'x'.repeat(140)}…`);
  });
});
