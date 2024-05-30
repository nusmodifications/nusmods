import { PureComponent } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { Module, Semester } from 'types/modules';
import { AddModuleData, PlannerModuleInfo } from 'types/planner';
import { getPlanToTake } from 'selectors/planner';

import { getFirstAvailableSemester } from 'utils/modules';
import { State as StoreState } from 'types/state';
import { addPlannerModule, removePlannerModule } from 'actions/planner';

import styles from './SaveModuleButton.scss';

type Props = {
  module: Module;
  planToTakeModules: PlannerModuleInfo[]; // List of module objects, get moduleCode
  className?: string;
  block?: boolean;

  addModule: (year: string, semester: Semester, module: AddModuleData) => void;
  removeModule: (id: string) => void;
};

type State = {
  loading: Semester | null;
};

function isModuleInPlanToTake(module: Module, planToTakeModules: PlannerModuleInfo[]): boolean {
  planToTakeModules.forEach((entry) => {
    if (entry.moduleCode === module.moduleCode) {
      return true;
    }
  });

  return false;
}

export class SaveModuleButtonComponent extends PureComponent<Props, State> {
  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    const { planToTakeModules, module } = nextProps;
    const { loading } = prevState;

    if (loading != null && isModuleInPlanToTake(module, planToTakeModules)) {
      return { loading: null };
    }

    return null;
  }

  override state: State = {
    loading: null,
  };

  // TODO: Link addPlannerModule and removePlannerModule functions to the button
  onSelect(semester: Semester) {
    const { module, planToTakeModules } = this.props;
    const PLAN_TO_TAKE_YEAR = '3000';
    const PLAN_TO_TAKE_SEMESTER = -2;

    if (isModuleInPlanToTake(module, planToTakeModules)) {
      this.props.removeModule(module.moduleCode);
    } else {
      this.setState({ loading: semester });
      this.props.addModule(PLAN_TO_TAKE_YEAR, PLAN_TO_TAKE_SEMESTER, {
        type: 'module',
        moduleCode: module.moduleCode,
      });
    }
  }

  buttonLabel(semester: Semester) {
    const hasModule = isModuleInPlanToTake(this.props.module, this.props.planToTakeModules);
    return hasModule ? (
      <>
        Remove from <br />
        <strong>Plan To Take</strong>
      </>
    ) : (
      <>
        Add to <br />
        <strong>Plan To Take</strong>
      </>
    );
  }

  override render() {
    const { block, className, module } = this.props;
    const defaultSemester = getFirstAvailableSemester(module.semesterData);

    return (
      <div
        className={classnames('btn-group', styles.buttonGroup, className, {
          'btn-block': block,
        })}
      >
        <button
          type="button"
          className={classnames('btn btn-outline-primary', {
            'btn-block': block,
          })}
          onClick={() => this.onSelect(defaultSemester)}
        >
          {this.buttonLabel(defaultSemester)}
        </button>
      </div>
    );
  }
}

const SaveModuleButtonConnected = connect(
  (state: StoreState) => ({
    planToTakeModules: getPlanToTake(state),
  }),
  { addModule: addPlannerModule, removeModule: removePlannerModule },
)(SaveModuleButtonComponent);

export default SaveModuleButtonConnected;
