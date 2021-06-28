import { useCallback } from 'react';

import type { ModuleSelectList } from 'types/reducers';
import type { ModuleCode } from 'types/modules';

import Online from 'views/components/Online';
import { createSearchPredicate, sortModules } from 'utils/moduleSearch';
import ModulesSelect from './ModulesSelect';

type Props = {
  moduleList: ModuleSelectList;
  addModule: (moduleCode: ModuleCode) => void;
  removeModule: (moduleCode: ModuleCode) => void;
};

const RESULTS_LIMIT = 500;

/**
 * Container for modules select
 * Governs the module filtering logic and non-select related logic such as notification.
 */
function ModulesSelectContainer({ moduleList, addModule, removeModule }: Props) {
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
          onChange={addModule}
          placeholder={
            isOnline ? 'Add module to the preference list' : 'You need to be online to add modules'
          }
          disabled={!isOnline}
          onRemoveModule={removeModule}
        />
      )}
    </Online>
  );
}

export default ModulesSelectContainer;
