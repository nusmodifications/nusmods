import { ProgrammeMap } from 'types/programmes';

const programmes: ProgrammeMap = {
  'soc-minor-computer-science': {
    id: 'soc-minor-computer-science',
    name: 'Minor in Computer Science',
    type: 'minor',
    faculty: 'School of Computing',
    source: 'https://www.comp.nus.edu.sg/programmes/ug/minorc/cs-minor/',
    lastVerified: '2026-07-09',
    cohort: 'AY2021/22 and after',
    totalMCs: 20,
    requirements: [
      {
        id: 'category-i',
        name: 'Category I: Programming Methodology',
        description: 'CS1010 or an equivalent course',
        minModules: 1,
        matchers: [
          {
            kind: 'modules',
            codes: [
              'CS1010',
              // Equivalents listed on the source page
              'CS1010E',
              'CS1010FC',
              'CS1010X',
              'CS1010J',
              'CS1010S',
              'CS1101S',
              'CS1020E',
            ],
          },
        ],
      },
      {
        id: 'category-ii',
        name: 'Category II: Three foundation courses',
        minModules: 3,
        minMCs: 12,
        matchers: [
          {
            kind: 'modules',
            codes: [
              // Alternatives from the source page footnotes: CS1231S or
              // MA1100/T for CS1231, CS2030S for CS2030, CS2040C/S for
              // CS2040, CS2113 for CS2103, EE4204 for CS2105
              'CS1231',
              'CS1231S',
              'MA1100',
              'MA1100T',
              'CS2030',
              'CS2030S',
              'CS2040',
              'CS2040C',
              'CS2040S',
              'CS2100',
              'CS2102',
              'CS2103',
              'CS2113',
              'CS2104',
              'CS2105',
              'EE4204',
              'CS2106',
              'CS2107',
              'CS2108',
              'CS2109S',
            ],
          },
        ],
      },
      {
        id: 'category-iii',
        name: 'Category III: Level-3000/4000 CS courses',
        description: 'CS-coded courses at level-3000 and 4000 to reach 20 units',
        minMCs: 4,
        matchers: [
          {
            kind: 'prefix',
            prefixes: ['CS'],
            minLevel: 3000,
            maxLevel: 4999,
          },
        ],
      },
    ],
  },
};

export default programmes;
