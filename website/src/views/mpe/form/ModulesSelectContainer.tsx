import { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';

import type { ModuleList, ModuleSelectListItem } from 'types/reducers';
import type { ModuleCode } from 'types/modules';
import type { MpePreference, MpeModule } from 'types/mpe';

import Online from 'views/components/Online';
import { createSearchPredicate, sortModules } from 'utils/moduleSearch';
import { State as StoreState } from 'types/state';
import ModulesSelect from './ModulesSelect';

type Props = {
  preferences: MpePreference[];
  mpeModuleList: MpeModule[];
  addModule: (moduleCode: ModuleCode) => void;
  removeModule: (moduleCode: ModuleCode) => void;
};

const RESULTS_LIMIT = 500;

function makeModuleList(
  moduleList: ModuleList,
  mpeModuleList: MpeModule[],
  preferences: MpePreference[],
): ModuleSelectListItem[] {
  const s1MpeModuleCodes = new Set(
    mpeModuleList.filter((mod) => mod.inS1MPE).map((mod) => mod.moduleCode),
  );
  const preferenceModuleCodes = new Set(preferences.map((preference) => preference.moduleCode));

  return moduleList
    .filter((module) => s1MpeModuleCodes.has(module.moduleCode))
    .map((module) => ({
      ...module,
      isAdded: preferenceModuleCodes.has(module.moduleCode),
      isAdding: false,
    }));
}

/**
 * Container for modules select
 * Governs the module filtering logic and non-select related logic such as notification.
 */
function ModulesSelectContainer(props: Props) {
  const unfilteredModuleList = useSelector((state: StoreState) => state.moduleBank.moduleList);
  const moduleList = useMemo(
    () => makeModuleList(unfilteredModuleList, props.mpeModuleList, props.preferences),
    [unfilteredModuleList, props.mpeModuleList, props.preferences],
  );

  const getFilteredModules = useCallback(
    (inputValue: string | null) => {
      if (!inputValue) return [];
      const predicate = createSearchPredicate(inputValue);
      const results = moduleList.filter(predicate);
      return sortModules(inputValue, results.slice(0, RESULTS_LIMIT));
    },
    [moduleList],
  );

  return (
    <Online>
      {(isOnline) => (
        <ModulesSelect
          getFilteredModules={getFilteredModules}
          moduleCount={moduleList.length}
          onChange={props.addModule}
          placeholder={
            isOnline ? 'Add module to the preference list' : 'You need to be online to add modules'
          }
          disabled={!isOnline}
          onRemoveModule={props.removeModule}
        />
      )}
    </Online>
  );
}

export default ModulesSelectContainer;
