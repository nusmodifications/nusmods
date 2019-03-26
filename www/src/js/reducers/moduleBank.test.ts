import { removeLRUModule, updateModuleTimestamp } from 'actions/moduleBank';
import { REMOVE_LRU_MODULE, UPDATE_MODULE_TIMESTAMP } from 'actions/constants';
import { ModuleBank } from 'types/reducers';
import reducer from './moduleBank';

const defaultModuleBankState: ModuleBank = {
  moduleList: [], // List of modules
  modules: {}, // Object of ModuleCode -> ModuleDetails
  moduleCodes: {},
  moduleArchive: {},
  apiLastUpdatedTimestamp: null,
};

describe(UPDATE_MODULE_TIMESTAMP, () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(12345);
  });

  afterEach(() => {
    // @ts-ignore
    Date.now.mockRestore();
  });

  it('should update module timestamp', () => {
    const modules: any = {
      CS1010S: { timestamp: 0 },
      ACC1000: { timestamp: 0 },
    };

    const before = {
      ...defaultModuleBankState,
      modules,
    };

    expect(reducer(before, updateModuleTimestamp('CS1010S'))).toMatchObject({
      modules: {
        CS1010S: { timestamp: 12345 },
        ACC1000: { timestamp: 0 },
      },
    });
  });
});

describe(REMOVE_LRU_MODULE, () => {
  it('should remove modules', () => {
    const modules: any = {
      CS1010S: {},
      ACC1000: {},
    };

    const before = {
      ...defaultModuleBankState,
      modules,
    };

    expect(reducer(before, removeLRUModule(['CS1010S']))).toMatchObject({
      modules: {
        ACC1000: {},
      },
    });
  });
});
