import { Label } from 'components/ui/label';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
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
          <Label htmlFor="input-mc">Units</Label>
          <Input
            ref={inputModuleCredit}
            id="input-mc"
            type="number"
            defaultValue={moduleCredit ? String(moduleCredit) : ''}
            required
            min="0"
          />
        </div>
        <div className="col-md-9">
          <Label htmlFor="input-title">Title (optional)</Label>
          <Input ref={inputTitle} id="input-title" type="text" defaultValue={title || ''} />
        </div>
      </div>

      <div className={styles.formAction}>
        <div>
          <Button variant="default" type="submit">
            Save
          </Button>
          <Button variant="link" type="button" onClick={props.onFinishEditing}>
            Cancel
          </Button>
        </div>

        {moduleInfo && (
          <Tooltip
            content={`Reset title to "${moduleInfo.title}" and credits to ${moduleInfo.moduleCredit}`}
          >
            <Button variant="secondary" type="button" onClick={resetCustomInfo}>
              Reset Info
            </Button>
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
