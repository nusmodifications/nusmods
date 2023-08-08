import * as React from 'react';
import { connect } from 'react-redux';

import { CustomModule } from 'types/reducers';
import { Module, ModuleCode } from 'types/modules';
import { State as StoreState } from 'types/state';

import Tooltip from 'views/components/Tooltip/Tooltip';
import { addCustomModule } from 'actions/planner';
import { getModuleCredit, getModuleTitle } from 'utils/planner';
import styles from './CustomModuleForm.scss';

type OwnProps = Readonly<{
  moduleCode: ModuleCode;
  onFinishEditing: () => void;
}>;

type Props = OwnProps &
  Readonly<{
    customInfo: CustomModule | null;
    moduleInfo: Module | null;
    addCustomModule: (moduleCode: ModuleCode, data: CustomModule) => void;
  }>;

export const CustomModuleFormComponent: React.FC<Props> = (props) => {
  // We use an uncontrolled form here because we don't want to update the
  // module title and MCs live
  const inputModuleCredit = React.createRef<HTMLInputElement>();
  const inputTitle = React.createRef<HTMLInputElement>();

  const onSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const inputModuleCreditCurrent = inputModuleCredit.current;
    const moduleCredit = inputModuleCreditCurrent && inputModuleCreditCurrent.value;
    const inputTitleCurrent = inputTitle.current;
    const title = inputTitleCurrent && inputTitleCurrent.value;

    // Module credit is required, module credit cannot be negative
    if (moduleCredit == null || parseInt(moduleCredit, 10) < 0) return;

    props.addCustomModule(props.moduleCode, {
      moduleCredit: +moduleCredit,
      title,
    });

    props.onFinishEditing();
  };

  const resetCustomInfo = () => {
    const { moduleInfo } = props;
    if (!moduleInfo) return;

    // We don't use props.addCustomModule because we don't want to save the reset
    // immediately in case the user wants to cancel
    if (inputModuleCredit.current) {
      inputModuleCredit.current.value = moduleInfo.moduleCredit;
    }

    if (inputTitle.current) {
      inputTitle.current.value = moduleInfo.title;
    }
  };

  const { moduleCode, moduleInfo, customInfo } = props;

  const plannerModule = { moduleCode, customInfo, moduleInfo };
  const moduleCredit = getModuleCredit(plannerModule);
  const title = getModuleTitle(plannerModule);

  return (
    <form onSubmit={onSubmit}>
      <h3 className={styles.heading}>Edit info for {moduleCode}</h3>

      <div className="form-row">
        <div className="col-md-3">
          <label htmlFor="input-mc">Units</label>
          <input
            ref={inputModuleCredit}
            id="input-mc"
            type="number"
            className="form-control"
            defaultValue={moduleCredit ? String(moduleCredit) : ''}
            required
            min="0"
          />
        </div>
        <div className="col-md-9">
          <label htmlFor="input-title">Title (optional)</label>
          <input
            ref={inputTitle}
            id="input-title"
            type="text"
            className="form-control"
            defaultValue={title || ''}
          />
        </div>
      </div>

      <div className={styles.formAction}>
        <div>
          <button type="submit" className="btn btn-primary">
            Save
          </button>
          <button type="button" className="btn btn-link" onClick={props.onFinishEditing}>
            Cancel
          </button>
        </div>

        {moduleInfo && (
          <Tooltip
            content={`Reset title to "${moduleInfo.title}" and credits to ${moduleInfo.moduleCredit}`}
          >
            <button type="button" className="btn btn-secondary" onClick={resetCustomInfo}>
              Reset Info
            </button>
          </Tooltip>
        )}
      </div>
    </form>
  );
};

const CustomModuleForm = connect(
  (state: StoreState, ownProps: OwnProps) => ({
    customInfo: state.planner.custom[ownProps.moduleCode],
    moduleInfo: state.moduleBank.modules[ownProps.moduleCode],
  }),
  {
    addCustomModule,
  },
)(React.memo(CustomModuleFormComponent));

export default CustomModuleForm;
