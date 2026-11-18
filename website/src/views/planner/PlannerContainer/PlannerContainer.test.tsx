import { shallow } from 'enzyme';

import { Module, ModuleCode } from 'types/modules';
import { PlannerState } from 'types/reducers';
import { nextTick } from 'test-utils/async';
import { PlannerContainerComponent, Props } from './PlannerContainer';

const MODULE_CODE: ModuleCode = 'CS1010S';

function noop() {}

/**
 * Shallow-render the unconnected component with mocked props. `fetchModule`
 * defaults to resolving; pass an implementation to simulate a failed fetch.
 */
function makeComponent(
  fetchModule: (moduleCode: ModuleCode) => Promise<Module> = () => Promise.resolve({} as Module),
) {
  const fetchModuleMock = vi.fn(fetchModule);
  const openNotification = vi.fn();
  const importPlanner = vi.fn();

  const props: Props = {
    modules: {},
    exemptions: [],
    planToTake: [],
    iblocsModules: [],
    iblocs: false,

    fetchModule: fetchModuleMock,
    openNotification,
    toggleFeedback: noop,
    addModule: noop,
    moveModule: noop,
    removeModule: noop,
    setPlaceholderModule: noop,
    addModuleToTimetable: noop,
    importPlanner,
    clearPlanner: noop,
    downloadPlanner: noop,
  };

  const wrapper = shallow(<PlannerContainerComponent {...props} />);
  const instance = wrapper.instance() as PlannerContainerComponent;

  return { instance, fetchModule: fetchModuleMock, openNotification, importPlanner };
}

function importedStateWith(modules: PlannerState['modules']): PlannerState {
  return {
    minYear: '2020/2021',
    maxYear: '2023/2024',
    iblocs: false,
    modules,
    custom: {},
  };
}

describe(PlannerContainerComponent, () => {
  describe('#fetchModuleOrNotify', () => {
    test('notifies the user when a module cannot be fetched', async () => {
      const { instance, openNotification } = makeComponent(() => Promise.reject(new Error('404')));

      await instance.fetchModuleOrNotify(MODULE_CODE);

      expect(openNotification).toHaveBeenCalledTimes(1);
      expect(openNotification).toHaveBeenCalledWith(expect.stringContaining(MODULE_CODE));
    });

    test('does not notify when the module is fetched successfully', async () => {
      const { instance, fetchModule, openNotification } = makeComponent();

      await instance.fetchModuleOrNotify(MODULE_CODE);

      expect(fetchModule).toHaveBeenCalledWith(MODULE_CODE);
      expect(openNotification).not.toHaveBeenCalled();
    });
  });

  describe('#onImportPlanner', () => {
    test('fetches each imported module and notifies the user on failure', async () => {
      const { instance, fetchModule, openNotification, importPlanner } = makeComponent(() =>
        Promise.reject(new Error('404')),
      );

      const importedState = importedStateWith({
        '0': { id: '0', year: '2020/2021', semester: 1, index: 0, moduleCode: MODULE_CODE },
        // Placeholder entries without a module code should be skipped
        '1': { id: '1', year: '2020/2021', semester: 1, index: 1, placeholderId: 'ue' },
      });

      instance.onImportPlanner(importedState);

      expect(importPlanner).toHaveBeenCalledWith(importedState);
      expect(fetchModule).toHaveBeenCalledTimes(1);
      expect(fetchModule).toHaveBeenCalledWith(MODULE_CODE);

      await nextTick();
      expect(openNotification).toHaveBeenCalledTimes(1);
      expect(openNotification).toHaveBeenCalledWith(expect.stringContaining(MODULE_CODE));
    });

    test('does not notify when imported modules are fetched successfully', async () => {
      const { instance, fetchModule, openNotification } = makeComponent();

      const importedState = importedStateWith({
        '0': { id: '0', year: '2020/2021', semester: 1, index: 0, moduleCode: MODULE_CODE },
      });

      instance.onImportPlanner(importedState);

      await nextTick();
      expect(fetchModule).toHaveBeenCalledWith(MODULE_CODE);
      expect(openNotification).not.toHaveBeenCalled();
    });
  });
});
