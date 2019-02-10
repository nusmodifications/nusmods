import * as React from 'react';
import { connect } from 'react-redux';

import { ModuleSelectList } from 'types/reducers';
import { ModuleCode, Semester } from 'types/modules';

import Online from 'views/components/Online';
import { popNotification } from 'actions/app';
import { getSemModuleSelectList } from 'selectors/moduleBank';
import { createSearchPredicate, sortModules } from 'utils/moduleSearch';
import ModulesSelect from './ModulesSelect';

type Props = {
  moduleList: ModuleSelectList;
  semester: Semester;
  addModule: (semester: Semester, moduleCode: ModuleCode) => void;
  popNotification: () => void;
};

const RESULTS_LIMIT = 500;

/**
 * Container for modules select
 * Governs the module filtering logic and non-select related logic such as notification.
 */
class ModulesSelectContainer extends React.Component<Props> {
  onChange = (moduleCode: ModuleCode) => {
    this.props.popNotification();
    this.props.addModule(this.props.semester, moduleCode);
  };

  getFilteredModules = (inputValue: string | null | undefined) => {
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
              isOnline ? 'Add module to timetable' : 'You need to be online to add modules'
            }
            disabled={!isOnline}
          />
        )}
      </Online>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { semester, timetable } = ownProps;
  const moduleList = getSemModuleSelectList(state, semester, timetable);

  return {
    semester,
    moduleList,
  };
}

export default connect(
  mapStateToProps,
  {
    popNotification,
  },
)(ModulesSelectContainer);
