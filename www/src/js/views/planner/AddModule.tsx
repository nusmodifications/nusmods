import React from 'react';
import classnames from 'classnames';
import { map } from 'lodash';

import { Semester } from 'types/modules';
import { AddModuleData } from 'types/planner';
import { placeholderGroups } from 'utils/placeholders';

import { Plus, Close } from 'views/components/icons';
import styles from './AddModule.scss';

type Props = Readonly<{
  year: string;
  semester: Semester;

  className?: string;
  onAddModule: (module: AddModuleData) => void;
}>;

type State = {
  readonly isOpen: boolean;
  readonly value: string;
};

const placeholderTitles: Record<keyof typeof placeholderGroups, string> = {
  general: 'University Level Requirements',
  cs: 'Computer Science',
};

export default class AddModule extends React.PureComponent<Props, State> {
  state = {
    isOpen: false,
    value: '',
  };

  textareaRef = React.createRef<HTMLTextAreaElement>();
  selectRef = React.createRef<HTMLSelectElement>();

  onSubmit = (evt: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    evt.preventDefault();

    const select = this.selectRef.current;
    const textArea = this.textareaRef.current;
    if (!select || !textArea) return;

    if (select.value) {
      this.props.onAddModule({
        type: 'placeholder',
        placeholderId: select.value,
      });
      select.value = '';
    } else {
      this.props.onAddModule({
        type: 'module',
        moduleCode: textArea.value.trim(),
      });

      textArea.value = '';
      textArea.focus();
    }
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
    return (
      <>
        <form onSubmit={this.onSubmit} className={classnames(this.props.className, styles.form)}>
          <label htmlFor={inputId} className="sr-only">
            Module Code
          </label>
          <div className="input-group">
            <textarea
              ref={this.textareaRef}
              id={inputId}
              className="form-control"
              placeholder="eg. CS1010S"
              value={this.state.value}
              onKeyDown={(evt) => {
                if (evt.key === 'Enter') this.onSubmit(evt);
                if (evt.key === 'Escape') this.onCancel();
              }}
              // We can use autofocus here because this element only appears when
              // the button is clicked
              autoFocus // eslint-disable-line jsx-a11y/no-autofocus
            />
          </div>

          <div className={styles.orDivider}>
            <span>or</span>
          </div>

          <select className="form-control form-control-sm" ref={this.selectRef} defaultValue="">
            <option value="">Select category</option>
            {map(placeholderGroups, (placeholderMap, group) => (
              <optgroup label={(placeholderTitles as Record<string, string>)[group]} key={group}>
                {map(placeholderMap, (placeholder, id) => (
                  <option key={id} value={id}>
                    {placeholder.name}
                  </option>
                ))}
              </optgroup>
            ))}
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
