import React from 'react';
import classnames from 'classnames';
import { map } from 'lodash';
import { X as Close, Plus } from 'react-feather';

import { ModuleCode, Semester } from 'types/modules';
import { AddModuleData } from 'types/planner';
import { placeholderGroups } from 'utils/placeholders';

import PlannerModuleSelect from './PlannerModuleSelect';
import styles from './AddModule.scss';

type Props = Readonly<{
  year: string;
  semester: Semester;

  className?: string;
  onAddModule: (module: AddModuleData) => void;
}>;

type State = {
  readonly isOpen: boolean;
};

const placeholderTitles: Record<keyof typeof placeholderGroups, string> = {
  general: 'University Level Requirements',
  cs: 'Computer Science',
};

const placeholderOptions = map(placeholderGroups, (placeholderMap, group) => (
  <optgroup label={(placeholderTitles as Record<string, string>)[group]} key={group}>
    {map(placeholderMap, (placeholder, id) => (
      <option key={id} value={id}>
        {placeholder.name}
      </option>
    ))}
  </optgroup>
));

export default class AddModule extends React.PureComponent<Props, State> {
  state = {
    isOpen: false,
  };

  selectRef = React.createRef<HTMLSelectElement>();

  onSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const select = this.selectRef.current;
    if (!select || !select.value) return;

    this.props.onAddModule({
      type: 'placeholder',
      placeholderId: select.value,
    });
    select.value = '';
  };

  onSelectModule = (input: ModuleCode | null) => {
    if (input) {
      this.props.onAddModule({
        type: 'module',
        moduleCode: input.trim(),
      });
    }

    this.onCancel();
  };

  onCancel = () => {
    this.setState({ isOpen: false });
  };

  render() {
    if (!this.state.isOpen) {
      return (
        <div className={this.props.className}>
          <button
            type="button"
            className={classnames(styles.toggle, 'btn btn-sm btn-link btn-block')}
            onClick={() => this.setState({ isOpen: true })}
          >
            <Plus />
            Add Modules
          </button>
        </div>
      );
    }

    const inputId = `${this.props.year}-${this.props.semester}`;

    // Bug in TypeScript ESLint parser prevents us from disabling this on just the line
    /* eslint-disable jsx-a11y/no-autofocus */
    return (
      <>
        <form onSubmit={this.onSubmit} className={classnames(this.props.className, styles.form)}>
          <label htmlFor={inputId} className="sr-only">
            Module Code
          </label>
          <div className="input-group">
            <PlannerModuleSelect
              id={inputId}
              rows={3}
              semester={this.props.semester}
              onSelect={this.onSelectModule}
              onCancel={this.onCancel}
            />
          </div>

          <div className={styles.orDivider}>
            <span>or</span>
          </div>

          <select className="form-control form-control-sm" ref={this.selectRef} defaultValue="">
            <option value="">Select category</option>
            {placeholderOptions}
          </select>

          <div className={styles.actions}>
            <button className={classnames('btn btn-primary')} type="submit">
              Add module
            </button>
            <button
              className={classnames(styles.cancel, 'btn btn-svg')}
              type="button"
              onClick={this.onCancel}
            >
              <Close />
              <span className="sr-only">Cancel</span>
            </button>
            <p className={styles.tip}>
              Tip: You can add multiple module at once, eg. copy from your transcript
            </p>
          </div>
        </form>
        <form />
      </>
    );
  }
}
