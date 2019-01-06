// @flow

import React, { PureComponent } from 'react';
import type { ModuleCode } from 'types/modules';

type Props = {
  onAddModule: (moduleCode: ModuleCode) => void,
};

type State = {
  isOpen: boolean,
  value: string,
};

export default class AddModule extends PureComponent<Props, State> {
  state = {
    isOpen: false,
    value: '',
  };

  onSubmit = (evt: SyntheticUIEvent<HTMLFormElement>) => {
    evt.preventDefault();
    this.props.onAddModule(this.state.value.trim());
    this.setState({ value: '', isOpen: false });
  };

  onBlur = () => {
    if (!this.state.value) {
      this.setState({ isOpen: false });
    }
  };

  render() {
    if (!this.state.isOpen) {
      return (
        <button className="btn btn-link btn-block" onClick={() => this.setState({ isOpen: true })}>
          Add Module
        </button>
      );
    }

    return (
      <form onSubmit={this.onSubmit}>
        <label>Module Code</label>
        <div className="input-group">
          <input
            className="form-control"
            placeholder="eg. CS1010S"
            value={this.state.value}
            onChange={(evt) => this.setState({ value: evt.target.value })}
            onBlur={this.onBlur}
            // We can use autofocus here because this element only appears when
            // the button is clicked
            autoFocus // eslint-disable-line jsx-a11y/no-autofocus
          />
        </div>
        <button className="btn btn-primary">Add module</button>
      </form>
    );
  }
}
