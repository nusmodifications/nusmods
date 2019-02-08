// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { State as StoreState } from 'reducers';
import type { CustomModule } from 'types/reducers';
import type { Module, ModuleCode } from 'types/modules';

import Tooltip from 'views/components/Tooltip/Tooltip';
import { addCustomModule } from 'actions/planner';
import { getModuleCredit, getModuleTitle } from 'utils/planner';
import styles from './CustomModuleForm.scss';

type OwnProps = {|
  +moduleCode: ModuleCode,
  +onFinishEditing: () => void,
|};

type Props = {|
  ...OwnProps,

  +customInfo: ?CustomModule,
  +moduleInfo: ?Module,
  +addCustomModule: (moduleCode: ModuleCode, data: CustomModule) => void,
|};

export class CustomModuleFormComponent extends PureComponent<Props> {
  onSubmit = (evt: SyntheticUIEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const moduleCredit = this.inputModuleCredit.current?.value;
    const title = this.inputTitle.current?.value;

    // Module credit is required
    if (moduleCredit == null) return;

    this.props.addCustomModule(this.props.moduleCode, {
      moduleCredit: +moduleCredit,
      title,
    });

    this.props.onFinishEditing();
  };

  // We use an uncontrolled form here because we don't want to update the
  // module title and MCs live
  inputModuleCredit = React.createRef<HTMLInputElement>();
  inputTitle = React.createRef<HTMLInputElement>();

  resetCustomInfo = () => {
    const { moduleInfo } = this.props;
    if (!moduleInfo) return;

    // We don't use props.addCustomModule because we don't want to save the reset
    // immediately in case the user wants to cancel
    if (this.inputModuleCredit.current) {
      this.inputModuleCredit.current.value = moduleInfo.ModuleCredit;
    }

    if (this.inputTitle.current) {
      this.inputTitle.current.value = moduleInfo.ModuleTitle;
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
              defaultValue={moduleCredit}
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
              defaultValue={title}
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
              content={`Reset title to "${moduleInfo.ModuleTitle}" and credits to ${
                moduleInfo.ModuleCredit
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
