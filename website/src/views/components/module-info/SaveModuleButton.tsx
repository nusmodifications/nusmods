import { PureComponent } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { State as StoreState } from 'types/state';

import { Module, ModuleCode, Semester } from 'types/modules';
import { getFirstAvailableSemester } from 'utils/modules';

import { PlannerModuleInfo } from 'types/planner';
import { getPlanToTake } from 'selectors/planner';
import { addPlanToTakeModule, removePlannerModule } from 'actions/planner';

import styles from './SaveModuleButton.scss';

type Props = {
  module: Module;
  planToTakeModules: PlannerModuleInfo[];
  className?: string;
  block?: boolean;

  addPlanToTakeModule: (moduleCode: ModuleCode) => void;
  removePlannerModule: (id: string) => void;
};

type State = Record<string, never>;

function findModule(
  module: Module,
  planToTakeModules: PlannerModuleInfo[],
): PlannerModuleInfo | undefined {
  return planToTakeModules.find((otherMod) => otherMod.moduleCode === module.moduleCode);
}

export class SaveModuleButtonComponent extends PureComponent<Props, State> {
  onSelect() {
    const { module, planToTakeModules } = this.props;
    const foundModule = findModule(module, planToTakeModules);
    if (foundModule) {
      this.props.removePlannerModule(foundModule.id);
    } else {
      this.props.addPlanToTakeModule(module.moduleCode);
    }
  }

  override render() {
    const { block, className, module, planToTakeModules } = this.props;
    const hasModule = findModule(module, planToTakeModules);
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
          onClick={() => this.onSelect()}
        >
          <>
            {hasModule ? 'Remove from' : 'Add to'} <br />
            <strong>Planner</strong>
          </>
        </button>
      </div>
    );
  }
}

const SaveModuleButtonConnected = connect(
  (state: StoreState) => ({
    planToTakeModules: getPlanToTake(state),
  }),
  { addPlanToTakeModule, removePlannerModule },
)(SaveModuleButtonComponent);

export default SaveModuleButtonConnected;
