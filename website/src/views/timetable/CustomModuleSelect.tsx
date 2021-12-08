import * as React from 'react';

import CloseButton from 'views/components/CloseButton';
import Modal from 'views/components/Modal';
import { PlusCircle } from 'react-feather';
import type { QRCodeProps } from 'react-qr-svg';
import type {
  Day,
  EndTime,
  LessonType,
  ModuleCode,
  ModuleTitle,
  Semester,
  StartTime,
  Venue,
} from 'types/modules';
import retryImport from 'utils/retryImport';
import classNames from 'classnames';
import styles from './CustomModuleSelect.scss';

type Props = {
  semester: Semester;
};

type State = {
  isOpen: boolean;
  moduleCode?: ModuleCode;
  title?: ModuleTitle;
  lessonType?: LessonType;
  venue?: Venue;
  day?: Day;
  startTime?: StartTime;
  endTime?: EndTime;
};

export default class CustomModulesSelect extends React.PureComponent<Props, State> {
  // React QR component is lazy loaded for performance
  static QRCode: React.ComponentType<QRCodeProps> | null;

  inputElements = Array(7).fill(React.createRef<HTMLInputElement>());

  fields = ['moduleCode', 'title', 'lessonType', 'venue', 'day', 'startTime', 'endTime'];

  // Save a copy of the current URL to detect when URL changes
  url: string | null = null;

  urlInput = React.createRef<HTMLInputElement>();

  state: State = {
    isOpen: false,
  };

  componentDidMount() {
    if (!CustomModulesSelect.QRCode) {
      retryImport(() => import(/* webpackChunkName: "export" */ 'react-qr-svg')).then((module) => {
        CustomModulesSelect.QRCode = module.QRCode;
        this.forceUpdate();
      });
    }
  }

  openModal = () => {
    this.setState({ isOpen: true });
  };

  closeModal = () =>
    this.setState({
      isOpen: false,
    });

  renderInputFields() {
    const { moduleCode, title, lessonType, venue, day, startTime, endTime } = this.state;

    return (
      <>
        <div className={styles.inputRow}>
          <div className={styles.inputColumn}>
            <label htmlFor="moduleCode">Module Code</label>
            <input
              ref={this.inputElements[0]}
              id="moduleCode"
              className="form-control"
              defaultValue={moduleCode || ''}
              required
            />
          </div>
          <div className={styles.inputColumn}>
            <label htmlFor="title">Title</label>
            <input
              ref={this.inputElements[1]}
              id="title"
              className="form-control"
              defaultValue={title || ''}
              required
            />
          </div>
        </div>
        <div className={styles.inputRow}>
          <div className={styles.inputColumnLarge}>
            <label htmlFor="lessonType">Lesson Type</label>
            <input
              ref={this.inputElements[2]}
              id="lessonType"
              className="form-control"
              defaultValue={lessonType || ''}
              required
            />
          </div>
        </div>
        <div className={styles.inputRow}>
          <div className={styles.inputColumnLarge}>
            <label htmlFor="venue">Venue</label>
            <input
              ref={this.inputElements[3]}
              id="venue"
              className="form-control"
              defaultValue={venue || ''}
              required
            />
          </div>
        </div>
        <div className={styles.inputRow}>
          <div className={styles.inputColumnSmall}>
            <label htmlFor="day">Day</label>
            <input
              ref={this.inputElements[4]}
              id="day"
              className="form-control"
              defaultValue={day || ''}
              required
            />
          </div>
          <div className={styles.inputColumnSmall}>
            <label htmlFor="startTime">Start Time</label>
            <input
              ref={this.inputElements[5]}
              id="startTime"
              className="form-control"
              defaultValue={startTime || ''}
              required
            />
          </div>
          <div className={styles.inputColumnSmall}>
            <label htmlFor="endTime">End Time</label>
            <input
              ref={this.inputElements[6]}
              id="endTime"
              className="form-control"
              defaultValue={endTime || ''}
              required
            />
          </div>
        </div>
        <div className={styles.inputRow}>
          <div className={styles.buttonColumn}>
            <button
              type="button"
              className="btn btn-outline-primary btn-svg"
              onClick={this.closeModal}
              onMouseOver={() => {}}
              onFocus={() => {}}
            >
              Add Custom Module
            </button>
          </div>
        </div>
      </>
    );
  }

  render() {
    const { isOpen } = this.state;

    return (
      <div className={styles.select}>
        <button
          type="button"
          className="btn btn-outline-primary btn-svg"
          onClick={this.openModal}
          onMouseOver={() => {}}
          onFocus={() => {}}
        >
          <PlusCircle className="svg svg-small" />
          Add Custom Module
        </button>

        <Modal isOpen={isOpen} onRequestClose={this.closeModal} animate>
          <CloseButton absolutePositioned onClick={this.closeModal} />
          <div className={styles.header}>
            <h3>Add a Custom Module</h3>
            <p>
              For DYOM students, teaching assistants, etc. who just need that one special slot on
              your timetable, we got you covered!
            </p>
            {this.renderInputFields()}
          </div>
        </Modal>
      </div>
    );
  }
}

/*
<div className={styles.inputColumn}>
<label htmlFor="input-mc">Subject</label>
  <input
    ref={this.inputElements[0]}
    id="input-mc"
    className="form-control"
    defaultValue={this.state["moduleCode"] || ''}
    required
  />
</div>
*/
