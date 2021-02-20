import { Component } from 'react';
import { connect } from 'react-redux';

import { ModuleSelectList, ModuleSelectListItem } from 'types/reducers';
import { ModuleCode, Semester } from 'types/modules';
import type { MpePreference } from 'types/mpe';

import Online from 'views/components/Online';
import { createSearchPredicate, sortModules } from 'utils/moduleSearch';
import { State as StoreState } from 'types/state';
import ModulesSelect from './ModulesSelect';

type OwnProps = {
  semester: Semester;
  moduleList: ModuleSelectList;
};

type Props = OwnProps & {
  preferences: MpePreference[];
  addModule: (moduleCode: ModuleCode) => void;
  removeModule: (moduleCode: ModuleCode) => Promise<void>;
};

const RESULTS_LIMIT = 500;

function isModuleinPreference(preferences: MpePreference[], moduleCode: ModuleCode) {
  return preferences.reduce<boolean>((acc, curr) => acc || curr.moduleCode === moduleCode, false);
}
function makeModuleList(state: StoreState, props: Props): ModuleSelectListItem[] {
  return state.moduleBank.moduleList.map((module) => ({
    ...module,
    isAdded: isModuleinPreference(props.preferences, module.moduleCode),
    isAdding: false,
  }));
}

/**
 * Container for modules select
 * Governs the module filtering logic and non-select related logic such as notification.
 */
class ModulesSelectContainer extends Component<Props> {
  onChange = (moduleCode: ModuleCode) => {
    this.props.addModule(moduleCode);
  };

  getFilteredModules = (inputValue: string | null) => {
    if (!inputValue) return [];
    const predicate = createSearchPredicate(inputValue);
    const results = this.props.moduleList.filter(predicate);
    return sortModules(inputValue, results.slice(0, RESULTS_LIMIT));
  };

  render() {
    return (
      <Online>
        {(isOnline) => (
          <ModulesSelect
            getFilteredModules={this.getFilteredModules}
            moduleCount={this.props.moduleList.length}
            onChange={this.onChange}
            placeholder={
              isOnline
                ? 'Add module to the preference list'
                : 'You need to be online to add modules'
            }
            disabled={!isOnline}
            onRemoveModule={this.props.removeModule}
          />
        )}
      </Online>
    );
  }
}

export default connect((state: StoreState, props: Props) => ({
  moduleList: makeModuleList(state, props),
}))(ModulesSelectContainer);
