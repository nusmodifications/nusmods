import { PlaceholderMap } from 'types/planner';

const placeholders: PlaceholderMap = {
  ge: {
    id: 'ge',
    name: 'GE modules',
    filter: (module) => !!module.moduleCode.match(/^GE[HQRST]/i),
  },
  get: {
    id: 'get',
    name: 'GET',
    filter: (module) => module.moduleCode.startsWith('GET'),
  },
  ges: {
    id: 'ges',
    name: 'GES',
    filter: (module) => module.moduleCode.startsWith('GES'),
  },
  ger: {
    id: 'ger',
    name: 'GER',
    filter: (module) => module.moduleCode.startsWith('GER'),
  },
  geq: {
    id: 'geq',
    name: 'GEQ',
    filter: (module) => module.moduleCode.startsWith('GEQ'),
  },
  geh: {
    id: 'geh',
    name: 'GEH',
    filter: (module) => module.moduleCode.startsWith('GEH'),
  },
};

export default placeholders;
