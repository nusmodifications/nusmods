import { ProgrammeMap } from 'types/programmes';

// CS focus areas are satisfied by completing 3 courses from the Area
// Primaries, with at least one course at level-4000 or above. This is
// modelled as two requirements: one level-4000 primary and two other
// primaries. Electives do not count towards satisfying a focus area, but
// are tracked as a pool so their MCs count towards the focus area total.
//
// Not modelled (see the * and # footnotes on the source page): courses that
// are cores in the student's degree cannot double-count towards CS Breadth
// and Depth, and some courses have an enforced selection process.
const programmes: ProgrammeMap = {
  'cs-focus-artificial-intelligence': {
    id: 'cs-focus-artificial-intelligence',
    name: 'Artificial Intelligence',
    type: 'focusArea',
    faculty: 'School of Computing',
    source: 'https://www.comp.nus.edu.sg/programmes/ug/focus/',
    lastVerified: '2026-07-09',
    requirements: [
      {
        id: 'primaries-4000',
        name: 'One level-4000 Area Primary',
        minModules: 1,
        matchers: [
          {
            kind: 'modules',
            codes: ['CS4243', 'CS4244', 'CS4246', 'CS4248', 'CS4262', 'CS4263'],
          },
        ],
      },
      {
        id: 'primaries',
        name: 'Two other Area Primaries',
        minModules: 2,
        matchers: [
          {
            kind: 'modules',
            codes: [
              'CS2109S',
              'CS3243',
              'CS3244',
              'CS3263',
              'CS3264',
              'CS3268',
              'CS4243',
              'CS4244',
              'CS4246',
              'CS4248',
              'CS4262',
              'CS4263',
            ],
          },
        ],
      },
      {
        id: 'electives',
        name: 'Electives',
        description: 'Electives do not count towards satisfying the focus area',
        matchers: [
          {
            kind: 'modules',
            codes: [
              'CS4220',
              'CS4261',
              'CS4269',
              'CS4277',
              'CS4278',
              'CS5215',
              'CS5228',
              'CS5242',
              'CS5260',
              'CS5339',
              'CS5340',
            ],
          },
        ],
      },
    ],
  },

  'cs-focus-software-engineering': {
    id: 'cs-focus-software-engineering',
    name: 'Software Engineering',
    type: 'focusArea',
    faculty: 'School of Computing',
    source: 'https://www.comp.nus.edu.sg/programmes/ug/focus/',
    lastVerified: '2026-07-09',
    requirements: [
      {
        id: 'primaries-4000',
        name: 'One level-4000 Area Primary',
        minModules: 1,
        matchers: [
          {
            kind: 'modules',
            codes: ['CS4211', 'CS4218', 'CS4239'],
          },
        ],
      },
      {
        id: 'primaries',
        name: 'Two other Area Primaries',
        minModules: 2,
        matchers: [
          {
            kind: 'modules',
            codes: [
              // CS2103/T on the source page
              'CS2103',
              'CS2103T',
              'CS3213',
              'CS3217',
              'CS3219',
              'CS3227',
              'CS3282',
              'CS4211',
              'CS4218',
              'CS4239',
            ],
          },
        ],
      },
      {
        id: 'electives',
        name: 'Electives',
        description: 'Electives do not count towards satisfying the focus area',
        matchers: [
          {
            kind: 'modules',
            codes: ['CS3203', 'CS3216', 'CS3226', 'CS3234', 'CS3281', 'CS5219', 'CS5232', 'CS5272'],
          },
        ],
      },
    ],
  },
};

export default programmes;
