import * as React from 'react';

import CloseButton from 'views/components/CloseButton';
import Modal from 'views/components/Modal';
import { ModuleCode, NumericWeeks, Semester, Semesters } from 'types/modules';
import { LESSON_TYPE_ABBREV } from 'utils/timetables';
import { Lesson, ModifiableLesson } from 'types/timetables';
import { appendCustomIdentifier, removeCustomIdentifier } from 'utils/custom';
import { SCHOOLDAYS, getLessonTimeHours, getLessonTimeMinutes } from 'utils/timify';
import { noop } from 'lodash';
import classNames from 'classnames';
import TimetableCell from './TimetableCell';
import styles from './CustomModuleModal.scss';
import CustomModuleModalDropdown from './CustomModuleModalDropdown';
import CustomModuleModalButtonGroup from './CustomModuleModalButtonGroup';
import CustomModuleModalField from './CustomModuleModalField';

export type Props = {
  customLessonData?: Lesson;
  isOpen: boolean;
  isEdit: boolean;
  semester: Semester;

  handleCustomModule: (oldModuleCode: ModuleCode, moduleCode: ModuleCode, lesson: Lesson) => void;
  closeModal: () => void;
};

type State = {
  lessonData: Lesson;
  isSubmitting: boolean;
};

const MINIMUM_CUSTOM_MODULE_DURATION_MINUTES = 60;
const INTERVAL_IN_MINUTES = 30;

const getPossibleWeeks = (semester: Semester) => {
  if (!Semesters.includes(semester)) throw new Error('Invalid semester');

  const numberOfWeeks = semester < 3 ? 13 : 6;

  return Array.from({ length: numberOfWeeks }, (_, i) => i + 1);
};

export default class CustomModuleModal extends React.PureComponent<Props, State> {
  fields = ['moduleCode', 'title', 'lessonType', 'venue', 'day', 'startTime', 'endTime'];

  DEFAULT_LESSON_STATE: Lesson = {
    moduleCode: '',
    title: '',
    lessonType: '',
    venue: '',
    day: 'Monday',
    startTime: '0800',
    endTime: '0900',
    classNo: '',
    isCustom: true,
    weeks: getPossibleWeeks(this.props.semester),
  };

  override state: State = {
    lessonData: {
      ...(this.props.customLessonData || this.DEFAULT_LESSON_STATE),
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

  setLessonStateViaSelect = (keyValue: { [key: string]: string | number[] }) => {
    const newState: State = {
      ...this.state,
      lessonData: {
        ...this.state.lessonData,
        ...keyValue,
      },
    };
    this.setState(newState);
    return null;
  };

  getLessonDetails = (): ModifiableLesson => ({
    ...this.state.lessonData,
    colorIndex: 0,
    moduleCode: appendCustomIdentifier(this.state.lessonData.moduleCode),
  });

  getValidationErrors = (): Record<string, string> => {
    const { moduleCode, startTime, endTime, classNo, weeks } = this.state.lessonData;
    const errors: Record<string, string> = {};

    if (moduleCode.length === 0) {
      errors.moduleCode = 'Module code is required';
    }

    if (classNo.length === 0) {
      errors.classNo = 'Class number is required';
    }

    if ((weeks as NumericWeeks).length === 0) {
      errors.weeks = 'Weeks are required. Select all to indicate every week';
    }

    const timeDifferenceInMinutes =
      (getLessonTimeHours(endTime) - getLessonTimeHours(startTime)) * 60 +
      (getLessonTimeMinutes(endTime) - getLessonTimeMinutes(startTime));

    if (timeDifferenceInMinutes < MINIMUM_CUSTOM_MODULE_DURATION_MINUTES) {
      errors.time = `Lesson must be ${MINIMUM_CUSTOM_MODULE_DURATION_MINUTES} mins or longer`;
    }

    return errors;
  };

  submitModule() {
    const errors = this.getValidationErrors();

    if (Object.keys(errors).length > 0) {
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
        lessonData: this.DEFAULT_LESSON_STATE,
      });
    }
    this.props.closeModal();
    this.setState({
      isSubmitting: false,
    });
  }

  renderTimeRanges(field: 'startTime' | 'endTime') {
    const errors = this.state.isSubmitting ? this.getValidationErrors() : {};

    const value =
      field === 'startTime' ? this.state.lessonData.startTime : this.state.lessonData.endTime;

    // Generate timeslots in 30 minute intervals
    let startIndex = 0;
    let numberIntervals =
      (24 * 60 - MINIMUM_CUSTOM_MODULE_DURATION_MINUTES) / INTERVAL_IN_MINUTES + 1;
    if (field === 'endTime') {
      const NUMBER_SLOT_MIN_DURATION = MINIMUM_CUSTOM_MODULE_DURATION_MINUTES / INTERVAL_IN_MINUTES;
      startIndex =
        (getLessonTimeHours(this.state.lessonData.startTime) * 60 +
          getLessonTimeMinutes(this.state.lessonData.startTime)) /
          30 +
        NUMBER_SLOT_MIN_DURATION;

      numberIntervals -= startIndex - NUMBER_SLOT_MIN_DURATION;
    }

    const timeslotIndices = Array.from({ length: numberIntervals }, (_, i) => i + startIndex);
    let timeslots = timeslotIndices.map((timeslot) => {
      const timeMinutes = timeslot * 30;
      const hourString = Math.floor(timeMinutes / 60)
        .toString()
        .padStart(2, '0');
      const minuteString = (timeMinutes % 60).toString().padStart(2, '0');
      const timeString = hourString + minuteString;
      return timeString;
    });

    if (field === 'endTime') {
      timeslots = timeslots.filter((time) => time > this.state.lessonData.startTime);
    }

    if (timeslots[timeslots.length - 1] === '2400') {
      timeslots[timeslots.length - 1] = '2359';
    }

    return (
      <CustomModuleModalDropdown
        options={timeslots}
        className={styles[field]}
        defaultSelectedOption={this.DEFAULT_LESSON_STATE[field]}
        value={value}
        onChange={(time) => {
          if (field === 'startTime' && this.state.lessonData.endTime < time) {
            const hours = getLessonTimeHours(time) + MINIMUM_CUSTOM_MODULE_DURATION_MINUTES / 60;
            const minutes =
              getLessonTimeMinutes(time) + (MINIMUM_CUSTOM_MODULE_DURATION_MINUTES % 60);

            let endTime = `${hours.toString().padStart(2, '0')}${minutes
              .toString()
              .padStart(2, '0')}`;

            if (endTime === '2400') {
              endTime = '2359';
            }
            this.setLessonStateViaSelect({
              startTime: time,
              endTime,
            });
          } else {
            this.setLessonStateViaSelect({ [field]: time });
          }
        }}
        error={errors.time}
        required
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
    const { moduleCode, title, classNo } = this.state.lessonData;
    const errors = this.state.isSubmitting ? this.getValidationErrors() : {};

    return (
      <>
        <div className={styles.row}>
          <div className={styles.column}>
            <CustomModuleModalField
              id="moduleCode"
              label="Module Code"
              errors={errors}
              defaultValue={moduleCode}
              setLessonStateViaInput={(e) => this.setLessonStateViaInput(e)}
            />
          </div>
          <div className={styles.column}>
            <CustomModuleModalField
              id="title"
              label="Title"
              errors={errors}
              defaultValue={title}
              setLessonStateViaInput={this.setLessonStateViaInput}
            />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.column}>
            <CustomModuleModalField
              id="classNo"
              label="Class Number"
              errors={errors}
              defaultValue={classNo || ''}
              setLessonStateViaInput={this.setLessonStateViaInput}
            />
          </div>
          <div className={styles.column}>
            <label htmlFor="select-lessonType">Lesson Type</label>
            <br />
            <CustomModuleModalDropdown
              options={Object.keys(LESSON_TYPE_ABBREV)}
              defaultText="Select Lesson Type"
              onChange={(lessonType) => this.setLessonStateViaSelect({ lessonType })}
              error={errors.lessonType}
              value={this.state.lessonData.lessonType}
            />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.columnLarge}>
            <CustomModuleModalField
              id="venue"
              label="Venue"
              errors={errors}
              defaultValue={this.DEFAULT_LESSON_STATE.venue}
              setLessonStateViaInput={this.setLessonStateViaInput}
            />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.columnSmall}>
            <label htmlFor="select-day">Day</label>
            <br />
            <CustomModuleModalDropdown
              options={SCHOOLDAYS.map((d) => d)}
              defaultSelectedOption={this.DEFAULT_LESSON_STATE.day}
              onChange={(d) => this.setLessonStateViaSelect({ day: d })}
              error={errors.day}
              value={this.state.lessonData.day}
              required
            />
          </div>
          <div className={styles.rowTime}>
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
        </div>
        <div className={styles.row}>
          <div className={classNames(styles.weeksContainer, styles.column)}>
            <label htmlFor="select-weeks">Weeks</label>
            <br />
            <CustomModuleModalButtonGroup
              options={getPossibleWeeks(this.props.semester)}
              defaultSelected={getPossibleWeeks(this.props.semester).map(() => true)} // Default to all weeks
              onChange={(weeksNumArr) => this.setLessonStateViaSelect({ weeks: weeksNumArr })}
              error={errors.weeks}
            />
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

  override render() {
    return (
      <Modal isOpen={this.props.isOpen} onRequestClose={this.props.closeModal} animate>
        <CloseButton absolutePositioned onClick={this.props.closeModal} />
        <div className={styles.header}>
          <h3>{this.props.isEdit ? <>Edit Custom Module</> : <>Add Custom Module</>}</h3>
          {this.renderModulePreview()}
          {this.renderInputFields()}
        </div>
      </Modal>
    );
  }
}
