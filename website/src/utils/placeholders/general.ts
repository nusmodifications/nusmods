import { PlaceholderMap } from 'types/planner';

const placeholders: PlaceholderMap = {
  ge: {
    id: 'ge',
    name: 'Any GE module',
    filter: (module) => !!module.moduleCode.match(/^GE[HQRST]/i),
  },
  get: {
    id: 'get',
    name: 'Any GET',
    filter: (module) => module.moduleCode.startsWith('GET'),
  },
  ges: {
    id: 'ges',
    name: 'Any GES',
    filter: (module) => module.moduleCode.startsWith('GES'),
  },
  ger: {
    id: 'ger',
    name: 'Any GER',
    filter: (module) => module.moduleCode.startsWith('GER'),
  },
  geq: {
    id: 'geq',
    name: 'Any GEQ',
    filter: (module) => module.moduleCode.startsWith('GEQ'),
  },
  geh: {
    id: 'geh',
    name: 'Any GEH',
    filter: (module) => module.moduleCode.startsWith('GEH'),
  },
};

export default placeholders;
