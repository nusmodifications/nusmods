import { Component } from 'react';
import { connect } from 'react-redux';

import { ModuleSelectList } from 'types/reducers';
import { ModuleCode, Semester } from 'types/modules';
import { SemTimetableConfig } from 'types/timetables';

import Online from 'views/components/Online';
import { popNotification } from 'actions/app';
import { createSearchPredicate, sortModules } from 'utils/moduleSearch';
import { State as StoreState } from 'types/state';
import ModulesSelect from './ModulesSelect';

type OwnProps = {
  timetable?: SemTimetableConfig;
  semester: Semester;
};

type Props = OwnProps & {
  moduleList?: ModuleSelectList;
  addModule: (moduleCode: ModuleCode) => void;
  removeModule?: (moduleCode: ModuleCode) => void;
  popNotification: () => void;
};

const RESULTS_LIMIT = 500;

/**
 * Container for modules select
 * Governs the module filtering logic and non-select related logic such as notification.
 */
class ModulesSelectContainer extends Component<Props> {
  onChange = (moduleCode: ModuleCode) => {
    this.props.popNotification();
    this.props.addModule(moduleCode);
  };

  getFilteredModules = (inputValue: string | null) => {
    if (!inputValue) return [];
    const predicate = createSearchPredicate(inputValue);
    const results = this.props.moduleList!.filter(predicate);
    return sortModules(inputValue, results.slice(0, RESULTS_LIMIT));
  };

  render() {
    return (
      <Online>
        {(isOnline) => (
          <ModulesSelect
            getFilteredModules={this.getFilteredModules}
            moduleCount={this.props.moduleList!.length}
            onChange={this.onChange}
            placeholder={
              isOnline
                ? 'Add module to the preference list'
                : 'You need to be online to add modules'
            }
            disabled={!isOnline}
            onRemoveModule={() => null} // {this.props.removeModule}
          />
        )}
      </Online>
    );
  }
}

function mapStateToProps(state: StoreState, ownProps: OwnProps) {
  const { semester, timetable } = ownProps;
  const { moduleList } = state.moduleBank;
  return {
    semester,
    moduleList,
  };
}

export default connect(mapStateToProps, {
  popNotification,
})(ModulesSelectContainer);
