import * as React from 'react';

import CloseButton from 'views/components/CloseButton';
import Modal from 'views/components/Modal';
import { ModuleCode, NumericWeeks } from 'types/modules';
import { LESSON_TYPE_ABBREV } from 'utils/timetables';
import { Lesson, ModifiableLesson } from 'types/timetables';
import { appendCustomIdentifier, removeCustomIdentifier } from 'utils/custom';
import { SCHOOLDAYS, getLessonTimeHours, getLessonTimeMinutes } from 'utils/timify';
import { noop } from 'lodash';
import classNames from 'classnames';
import { EVERY_WEEK } from 'test-utils/timetable';
import TimetableCell from './TimetableCell';
import styles from './CustomModuleModal.scss';
import CustomModuleModalDropdown from './CustomModuleModalDropdown';
import CustomModuleModalButtonGroup from './CustomModuleModalButtonGroup';

export type Props = {
  customLessonData?: Lesson;
  semesterWeeks: string[];
  isOpen: boolean;
  isEdit: boolean;

  handleCustomModule: (oldModuleCode: ModuleCode, moduleCode: ModuleCode, lesson: Lesson) => void;
  closeModal: () => void;
};

type State = {
  lessonData: Lesson;
  isSubmitting: boolean;
};

const DEFAULT_LESSON_STATE: Lesson = {
  moduleCode: '',
  title: '',
  lessonType: '',
  venue: '',
  day: 'Monday',
  startTime: '0800',
  endTime: '0900',
  classNo: '',
  isCustom: true,
  weeks: EVERY_WEEK,
};

export default class CustomModuleModal extends React.PureComponent<Props, State> {
  fields = ['moduleCode', 'title', 'lessonType', 'venue', 'day', 'startTime', 'endTime'];

  override state: State = {
    lessonData: {
      ...(this.props.customLessonData || DEFAULT_LESSON_STATE),
      moduleCode: this.props.customLessonData
        ? removeCustomIdentifier(this.props.customLessonData.moduleCode)
        : '',
    },
    isSubmitting: false,
  };

  setLessonStateViaInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newState: State = {
      ...this.state,
      lessonData: {
        ...this.state.lessonData,
        [event.target.name]: event.target.value,
      },
    };
    this.setState(newState);
    return null;
  };

  setLessonStateViaSelect = (key: string, value: string | number[]) => {
    const newState: State = {
      ...this.state,
      lessonData: {
        ...this.state.lessonData,
        [key]: value,
      },
    };
    this.setState(newState);
    return null;
  };

  getLessonDetails = (): ModifiableLesson => ({
    ...this.state.lessonData,
    colorIndex: 0,
  });

  getValidationErrors = (): string[] => {
    const { moduleCode, title, venue, startTime, endTime, classNo, lessonType, weeks } =
      this.state.lessonData;
    const errors: string[] = [];

    if (moduleCode.length === 0) {
      errors.push('Please enter a Module Code.');
    }

    if (title.length === 0) {
      errors.push('Please enter a Title.');
    }

    if (classNo.length === 0) {
      errors.push('Please enter a Class Number.');
    }

    if (lessonType.length === 0) {
      errors.push('Please enter a Lesson Type.');
    }

    if (venue.length === 0) {
      errors.push('Please enter a Venue.');
    }

    if ((weeks as NumericWeeks).length === 0) {
      errors.push('Please enter Weeks.');
    }

    const timeDifferenceInMinutes =
      (getLessonTimeHours(endTime) - getLessonTimeHours(startTime)) * 60 +
      (getLessonTimeMinutes(endTime) - getLessonTimeMinutes(startTime));

    if (timeDifferenceInMinutes < 60) {
      errors.push('Start and End Time must be at least 1 hour apart.');
    }

    return errors;
  };

  submitModule() {
    const errors = this.getValidationErrors();

    if (errors.length > 0) {
      this.setState({
        isSubmitting: true,
      });
      return;
    }

    const { moduleCode } = this.state.lessonData;
    const { isEdit, handleCustomModule, customLessonData } = this.props;

    const customModuleCode = appendCustomIdentifier(moduleCode);

    const submittedLessonData = {
      ...this.state.lessonData,
      moduleCode: customModuleCode,
    };

    if (isEdit) {
      handleCustomModule(
        customLessonData ? customLessonData.moduleCode : '',
        submittedLessonData.moduleCode,
        submittedLessonData,
      );
    } else {
      handleCustomModule(
        submittedLessonData.moduleCode,
        submittedLessonData.moduleCode,
        submittedLessonData,
      );
      this.setState({
        lessonData: DEFAULT_LESSON_STATE,
      });
    }
    this.props.closeModal();
    this.setState({
      isSubmitting: false,
    });
  }

  renderLessonTypes() {
    return (
      <CustomModuleModalDropdown
        options={Object.keys(LESSON_TYPE_ABBREV)}
        defaultText="Select Lesson Type"
        onChange={(lessonType) => this.setLessonStateViaSelect('lessonType', lessonType)}
      />
    );
  }

  renderWorkingDays() {
    const { day: currentDays } = this.state.lessonData;
    return (
      <CustomModuleModalDropdown
        options={SCHOOLDAYS.map((day) => day)}
        defaultSelectedOption={currentDays}
        onChange={(day) => this.setLessonStateViaSelect('day', day)}
      />
    );
  }

  renderTimeRanges(field: string) {
    const minTimeInHalfHours = 15;
    const numberOfTimeSlots = 28;

    const value =
      field === 'startTime' ? this.state.lessonData.startTime : this.state.lessonData.endTime;
    const timeslots = Array.from({ length: numberOfTimeSlots }, (_, i) => i + 1);

    return (
      <CustomModuleModalDropdown
        options={timeslots.map((timeslot) => {
          const timeMinutes = (minTimeInHalfHours + timeslot) * 30;
          const hourString = Math.floor(timeMinutes / 60)
            .toString()
            .padStart(2, '0');
          const minuteString = (timeMinutes % 60).toString().padStart(2, '0');
          const timeString = hourString + minuteString;
          return timeString;
        })}
        defaultSelectedOption={value}
        onChange={(time) => this.setLessonStateViaSelect(field, time)}
      />
    );
  }

  renderWeeks() {
    return (
      <CustomModuleModalButtonGroup
        options={EVERY_WEEK}
        defaultSelected={EVERY_WEEK.map(() => true)} // Default to all weeks
        onChange={(weeksNumArr) => this.setLessonStateViaSelect('weeks', weeksNumArr)}
      />
    );
  }

  renderModulePreview() {
    return (
      <div className={styles.row}>
        <div className={styles.column}>
          <label htmlFor="custom-preview"> With Title </label>
          <TimetableCell
            key="custom-preview"
            style={undefined}
            lesson={this.getLessonDetails()}
            showTitle
            hoverLesson={undefined}
            onHover={noop}
            transparent={false}
          />
        </div>
        <div className={styles.column}>
          <label htmlFor="custom-preview-no-title"> Without Title </label>
          <TimetableCell
            key="custom-preview-no-title"
            style={undefined}
            lesson={this.getLessonDetails()}
            showTitle={false}
            hoverLesson={undefined}
            onHover={noop}
            transparent={false}
          />
        </div>
      </div>
    );
  }

  renderInputFields() {
    const { moduleCode, title, venue, classNo } = this.state.lessonData;

    return (
      <>
        <div className={styles.row}>
          <div className={styles.column}>
            <label htmlFor="select-moduleCode">Module Code</label>
            <input
              name="moduleCode"
              onChange={(e) => this.setLessonStateViaInput(e)}
              id="select-moduleCode"
              className="form-control"
              defaultValue={moduleCode || ''}
              required
            />
          </div>
          <div className={styles.column}>
            <label htmlFor="select-title">Title</label>
            <input
              name="title"
              onChange={(e) => this.setLessonStateViaInput(e)}
              id="select-title"
              className="form-control"
              defaultValue={title || ''}
              required
            />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.columnSmall}>
            <label htmlFor="select-classNo">Class Number</label>
            <input
              name="classNo"
              onChange={(e) => this.setLessonStateViaInput(e)}
              id="select-classNo"
              className="form-control"
              defaultValue={classNo || ''}
              required
            />
          </div>
          <div className={styles.columnLarge}>
            <label htmlFor="select-lessonType">Lesson Type</label>
            <br />
            {this.renderLessonTypes()}
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.columnLarge}>
            <label htmlFor="select-venue">Venue</label>
            <input
              name="venue"
              onChange={(e) => this.setLessonStateViaInput(e)}
              id="select-venue"
              className="form-control"
              defaultValue={venue || ''}
              required
            />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.columnSmall}>
            <label htmlFor="select-day">Day</label>
            <br />
            {this.renderWorkingDays()}
          </div>
          <div className={styles.columnSmall}>
            <label htmlFor="select-startTime">Start Time</label>
            <br />
            {this.renderTimeRanges('startTime')}
          </div>
          <div className={styles.columnSmall}>
            <label htmlFor="select-endTime">End Time</label>
            <br />
            {this.renderTimeRanges('endTime')}
          </div>
        </div>
        <div className={styles.row}>
          <div className={classNames(styles.weeksContainer, styles.column)}>
            <label htmlFor="select-weeks">Weeks</label>
            <br />
            {this.renderWeeks()}
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.buttonColumn}>
            <button
              type="button"
              className="btn btn-outline-primary btn-svg"
              onClick={() => this.submitModule()}
            >
              {this.props.isEdit ? <>Edit Custom Module</> : <>Add Custom Module</>}
            </button>
          </div>
        </div>
      </>
    );
  }

  renderErrors() {
    const errors = this.getValidationErrors();

    if (errors.length === 0) {
      return null;
    }

    return (
      <div className="alert alert-danger">
        {errors.map((error) => (
          <>
            {error}
            <br />
          </>
        ))}
      </div>
    );
  }

  override render() {
    const { isSubmitting } = this.state;

    return (
      <Modal isOpen={this.props.isOpen} onRequestClose={this.props.closeModal} animate>
        <CloseButton absolutePositioned onClick={this.props.closeModal} />
        <div className={styles.header}>
          <h3>{this.props.isEdit ? <>Edit Custom Module</> : <>Add Custom Module</>}</h3>
          {isSubmitting && this.renderErrors()}
          {this.renderModulePreview()}
          {this.renderInputFields()}
        </div>
      </Modal>
    );
  }
}
