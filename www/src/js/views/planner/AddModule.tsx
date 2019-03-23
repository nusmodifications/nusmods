import * as React from 'react';
import classnames from 'classnames';
import { Semester } from 'types/moduleBaseTypes';
import { Plus, Close } from 'views/components/icons';
import styles from './AddModule.scss';

type Props = {
  readonly year: string;
  readonly semester: Semester;

  readonly className?: string;
  readonly onAddModule: (input: string) => void;
};

type State = {
  readonly isOpen: boolean;
  readonly value: string;
};

export default class AddModule extends React.PureComponent<Props, State> {
  state = {
    isOpen: false,
    value: '',
  };

  textareaRef = React.createRef<HTMLTextAreaElement>();

  onSubmit = (evt: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    evt.preventDefault();
    this.props.onAddModule(this.state.value.trim());
    this.setState({ value: '' });

    if (this.textareaRef.current) {
      this.textareaRef.current.focus();
    }
  };

  onBlur = () => {
    if (!this.state.value) {
      this.setState({ isOpen: false });
    }
  };

  onCancel = () => {
    this.setState({ value: '', isOpen: false });
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
            onChange={(evt) => this.setState({ value: evt.target.value })}
            onBlur={this.onBlur}
            // We can use autofocus here because this element only appears when
            // the button is clicked
            autoFocus // eslint-disable-line jsx-a11y/no-autofocus
          />
        </div>
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
    );
  }
}
