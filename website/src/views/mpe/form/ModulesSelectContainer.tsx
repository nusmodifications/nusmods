import { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { ModuleList, ModuleSelectList, ModuleSelectListItem } from 'types/reducers';
import { ModuleCode, Semester } from 'types/modules';
import type { MpePreference } from 'types/mpe';

import Online from 'views/components/Online';
import { createSearchPredicate, sortModules } from 'utils/moduleSearch';
import { State as StoreState } from 'types/state';
import ModulesSelect from './ModulesSelect';

type Props = {
  preferences: MpePreference[];
  addModule: (moduleCode: ModuleCode) => void;
  removeModule: (moduleCode: ModuleCode) => Promise<void>;
};

const RESULTS_LIMIT = 500;

function isModuleInPreference(preferences: MpePreference[], moduleCode: ModuleCode) {
  return preferences.some((preference) => preference.moduleCode === moduleCode);
}
function makeModuleList(
  moduleList: ModuleList,
  preferences: MpePreference[],
): ModuleSelectListItem[] {
  return moduleList.map((module) => ({
    ...module,
    isAdded: isModuleInPreference(preferences, module.moduleCode),
    isAdding: false,
  }));
}

/**
 * Container for modules select
 * Governs the module filtering logic and non-select related logic such as notification.
 */
function ModulesSelectContainer(props: Props) {
  const unfilteredModuleList = useSelector((state: StoreState) => state.moduleBank.moduleList);
  const moduleList = useMemo(() => makeModuleList(unfilteredModuleList, props.preferences), [
    unfilteredModuleList,
    props.preferences,
  ]);

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
