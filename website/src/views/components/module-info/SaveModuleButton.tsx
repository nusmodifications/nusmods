import { PureComponent } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { State as StoreState } from 'types/state';

import { Module, Semester } from 'types/modules';
import { getFirstAvailableSemester } from 'utils/modules';

import { AddModuleData, PlannerModuleInfo } from 'types/planner';
import { getPlanToTake } from 'selectors/planner';
import { addPlannerModule, removePlannerModule } from 'actions/planner';

import styles from './SaveModuleButton.scss';

type Props = {
  module: Module;
  planToTakeModules: PlannerModuleInfo[];
  className?: string;
  block?: boolean;

  addModule: (year: string, semester: Semester, module: AddModuleData) => void;
  removeModule: (id: string) => void;
};

type State = {
  loading: Semester | null;
};

function isModuleInPlanToTake(module: Module, planToTakeModules: PlannerModuleInfo[]): boolean {
  for (let i = 0; i < planToTakeModules.length; i++) {
    if (planToTakeModules[i].moduleCode === module.moduleCode) {
      return true;
    }
  }

  return false;
}

function getModuleId(module: Module, planToTakeModules: PlannerModuleInfo[]): string {
  // If duplicate ids, gets the first id.
  for (let i = 0; i < planToTakeModules.length; i++) {
    if (planToTakeModules[i].moduleCode === module.moduleCode) {
      return planToTakeModules[i].id;
    }
  }
  return '0';
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

  onSelect(semester: Semester) {
    const { module, planToTakeModules } = this.props;
    const PLAN_TO_TAKE_YEAR = '3000';
    const PLAN_TO_TAKE_SEMESTER = -2;

    if (isModuleInPlanToTake(module, planToTakeModules)) {
      const id = getModuleId(module, planToTakeModules);
      this.props.removeModule(id);
    } else {
      this.setState({ loading: semester });
      this.props.addModule(PLAN_TO_TAKE_YEAR, PLAN_TO_TAKE_SEMESTER, {
        type: 'module',
        moduleCode: module.moduleCode,
      });
    }
  }

  buttonLabel() {
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
          {this.buttonLabel()}
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
