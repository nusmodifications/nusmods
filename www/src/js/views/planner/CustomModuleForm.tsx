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

export class CustomModuleFormComponent extends React.PureComponent<Props> {
  // We use an uncontrolled form here because we don't want to update the
  // module title and MCs live
  inputModuleCredit = React.createRef<HTMLInputElement>();
  inputTitle = React.createRef<HTMLInputElement>();

  onSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const inputModuleCredit = this.inputModuleCredit.current;
    const moduleCredit = inputModuleCredit && inputModuleCredit.value;
    const inputTitle = this.inputTitle.current;
    const title = inputTitle && inputTitle.value;

    // Module credit is required
    if (moduleCredit == null) return;

    this.props.addCustomModule(this.props.moduleCode, {
      moduleCredit: +moduleCredit,
      title,
    });

    this.props.onFinishEditing();
  };

  resetCustomInfo = () => {
    const { moduleInfo } = this.props;
    if (!moduleInfo) return;

    // We don't use props.addCustomModule because we don't want to save the reset
    // immediately in case the user wants to cancel
    if (this.inputModuleCredit.current) {
      this.inputModuleCredit.current.value = moduleInfo.moduleCredit;
    }

    if (this.inputTitle.current) {
      this.inputTitle.current.value = moduleInfo.title;
    }
  };

  render() {
    const { moduleCode, moduleInfo, customInfo } = this.props;

    const plannerModule = { moduleCode, customInfo, moduleInfo };
    const moduleCredit = getModuleCredit(plannerModule);
    const title = getModuleTitle(plannerModule);

    return (
      <form onSubmit={this.onSubmit}>
        <h3 className={styles.heading}>Edit info for {moduleCode}</h3>

        <div className="form-row">
          <div className="col-md-3">
            <label htmlFor="input-mc">Module Credits</label>
            <input
              ref={this.inputModuleCredit}
              id="input-mc"
              type="number"
              className="form-control"
              defaultValue={moduleCredit ? String(moduleCredit) : ''}
              required
            />
          </div>
          <div className="col-md-9">
            <label htmlFor="input-title">Title (optional)</label>
            <input
              ref={this.inputTitle}
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
            <button type="button" className="btn btn-link" onClick={this.props.onFinishEditing}>
              Cancel
            </button>
          </div>

          {moduleInfo && (
            <Tooltip
              content={`Reset title to "${moduleInfo.title}" and credits to ${
                moduleInfo.moduleCredit
              }`}
            >
              <button type="button" className="btn btn-secondary" onClick={this.resetCustomInfo}>
                Reset Info
              </button>
            </Tooltip>
          )}
        </div>
      </form>
    );
  }
}

const CustomModuleForm = connect(
  (state: StoreState, ownProps: OwnProps) => ({
    customInfo: state.planner.custom[ownProps.moduleCode],
    moduleInfo: state.moduleBank.modules[ownProps.moduleCode],
  }),
  {
    addCustomModule,
  },
)(CustomModuleFormComponent);

export default CustomModuleForm;
