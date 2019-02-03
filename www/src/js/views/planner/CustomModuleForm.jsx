// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { State as StoreState } from 'reducers';
import type { CustomModule } from 'types/reducers';
import type { ModuleCode } from 'types/modules';

import { addCustomModule } from 'actions/planner';
import styles from './CustomModuleForm.scss';

type OwnProps = {|
  +moduleCode: ModuleCode,
  +onFinishEditing: () => void,
|};

type Props = {|
  ...OwnProps,

  +data: ?CustomModule,
  +addCustomModule: (moduleCode: ModuleCode, data: CustomModule) => void,
|};

export class CustomModuleFormComponent extends PureComponent<Props> {
  onSubmit = (evt: SyntheticUIEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const moduleCredit = this.inputModuleCredit.current?.value;
    const title = this.inputTitle.current?.value;

    if (moduleCredit == null) return;

    const data = {
      moduleCredit: +moduleCredit,
      title,
    };

    this.props.addCustomModule(this.props.moduleCode, data);
    this.props.onFinishEditing();
  };

  inputModuleCredit = React.createRef<HTMLInputElement>();
  inputTitle = React.createRef<HTMLInputElement>();

  render() {
    const { moduleCode, data } = this.props;

    return (
      <form onSubmit={this.onSubmit}>
        <h3 className={styles.heading}>Edit {moduleCode}</h3>

        <div className="form-row">
          <div className="col-md-3">
            <label htmlFor="input-mc">Module Credits</label>
            <input
              ref={this.inputModuleCredit}
              id="input-mc"
              type="number"
              className="form-control"
              defaultValue={data?.moduleCredit}
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
              defaultValue={data?.title}
            />
          </div>
        </div>

        <div className={styles.formAction}>
          <button type="submit" className="btn btn-primary">
            Save
          </button>

          <button type="button" className="btn btn-link" onClick={this.props.onFinishEditing}>
            Cancel
          </button>
        </div>
      </form>
    );
  }
}

const CustomModuleForm = connect(
  (state: StoreState, ownProps: OwnProps) => ({
    data: state.planner.custom[ownProps.moduleCode],
  }),
  {
    addCustomModule,
  },
)(CustomModuleFormComponent);

export default CustomModuleForm;
