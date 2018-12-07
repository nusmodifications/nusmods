// @flow
import reducer from './moduleBank';
import {
  REMOVE_LRU_MODULE,
  removeLRUModule,
  UPDATE_MODULE_TIMESTAMP,
  updateModuleTimestamp,
} from 'actions/moduleBank';
import type { ModuleBank } from './moduleBank';

const defaultModuleBankState: ModuleBank = {
  moduleList: [], // List of modules
  modules: {}, // Object of ModuleCode -> ModuleDetails
  moduleCodes: {},
  apiLastUpdatedTimestamp: undefined,
};

describe(UPDATE_MODULE_TIMESTAMP, () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(12345);
  });

  afterEach(() => {
    Date.now.mockRestore();
  });

  it('should update module timestamp', () => {
    const modules = {
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
    const modules = {
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
