import * as React from 'react';

import CloseButton from 'views/components/CloseButton';
import Modal from 'views/components/Modal';
import {
  CustomLesson,
  ModuleCode,
  NumericWeeks,
  Semester,
  Semesters,
  WeekRange,
  Weeks,
} from 'types/modules';
import { LESSON_TYPE_ABBREV } from 'utils/timetables';
import { ModifiableLesson } from 'types/timetables';
import { appendCustomIdentifier, removeCustomIdentifier } from 'utils/customModule';
import { SCHOOLDAYS, getLessonTimeHours, getLessonTimeMinutes } from 'utils/timify';
import { noop } from 'lodash';
import classNames from 'classnames';
import academicCalendarJSON from 'data/academic-calendar';
import { addWeeks, parse, parseISO } from 'date-fns';
import NUSModerator from 'nusmoderator';
import TimetableCell from './TimetableCell';
import styles from './CustomModuleModal.scss';
import CustomModuleModalDropdown from './CustomModuleModalDropdown';
import CustomModuleModalField from './CustomModuleModalField';
import CustomModuleModalWeekRangeSelector from './CustomModuleModalWeekRangeSelector';
import CustomModuleModalWeekButtonSelector from './CustomModuleModalWeekButtonSelector';
import CustomModuleModalSlotSelector from './CustomModuleModalSlotSelector';

export type Props = {
  moduleCode?: ModuleCode;
  moduleTitle?: string;
  customLessonData?: CustomLesson[];
  isOpen: boolean;
  isEdit: boolean;
  semester: Semester;

  handleCustomModule: (
    oldModuleCode: ModuleCode,
    moduleCode: ModuleCode,
    title: string,
    lessons: CustomLesson[],
  ) => void;
  isModuleCodeAdded: (moduleCode: ModuleCode) => boolean;
  closeModal: () => void;
};

type State = {
  selectedIndex: number; // Index of the lesson being added/edited
  maxIndex: number; // Index of the last lesson + 1

  moduleCode: ModuleCode;
  moduleTitle: string;
  lessonData: CustomLesson[];
  isSubmitting: boolean;
};

const MINIMUM_CUSTOM_MODULE_DURATION_MINUTES = 60;
const INTERVAL_IN_MINUTES = 30;

const isSpecialTerm = (semester: Semester) => semester >= 3;

const getDefaultWeeks = (semester: Semester): Weeks => {
  if (!isSpecialTerm(semester)) return Array.from({ length: 13 }, (_, i) => i + 1);

  // Convert shortened AY to full e.g. 24/25 to 2024/2025
  const year = NUSModerator.academicCalendar
    .getAcadYear(new Date())
    .year.split('/')
    .map((x) => `20${x}`)
    .join('/');

  const semStart = parse(
    academicCalendarJSON[year][semester].start.join('-'),
    'yyyy-MM-dd',
    new Date(),
  );
  const semEnd = addWeeks(semStart, 6);
  return {
    start: semStart.toISOString(),
    end: semEnd.toISOString(),
  };
};

export default class CustomModuleModal extends React.PureComponent<Props, State> {
  fields = ['moduleCode', 'title', 'lessonType', 'venue', 'day', 'startTime', 'endTime'];

  DEFAULT_LESSON_STATE: CustomLesson = {
    lessonType: '',
    venue: '',
    day: 'Monday',
    startTime: '0800',
    endTime: '0900',
    classNo: '',
    weeks: getDefaultWeeks(this.props.semester),
  };

  override state: State = {
    selectedIndex: 0,
    maxIndex: this.props.customLessonData?.length ?? 1,

    moduleCode: removeCustomIdentifier(this.props.moduleCode ?? '', true),
    moduleTitle: this.props.moduleTitle ?? '',
    lessonData: this.props.customLessonData ?? [this.DEFAULT_LESSON_STATE],
    isSubmitting: false,
  };

  resetState = () => {
    this.setState({
      selectedIndex: 0,
      maxIndex: this.props.customLessonData?.length ?? 1,

      moduleCode: removeCustomIdentifier(this.props.moduleCode ?? '', true),
      moduleTitle: this.props.moduleTitle ?? '',
      lessonData: this.props.customLessonData ?? [this.DEFAULT_LESSON_STATE],
      isSubmitting: false,
    });
  };

  setModuleCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState((prev) => ({ ...prev, moduleCode: event.target.value }));
  };

  setModuleTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState((prev) => ({ ...prev, moduleTitle: event.target.value }));
  };

  setLessonStateViaInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newState: State = {
      ...this.state,
      lessonData: this.state.lessonData.map((lesson, index) => {
        if (index === this.state.selectedIndex) {
          return {
            ...lesson,
            [event.target.name]: event.target.value,
          };
        }
        return structuredClone(lesson);
      }),
    };
    this.setState(newState);
    return null;
  };

  setLessonStateViaSelect = (keyValue: { [key: string]: string | Weeks }) => {
    const newState: State = {
      ...this.state,
      lessonData: this.state.lessonData.map((lesson, index) => {
        if (index === this.state.selectedIndex) {
          return {
            ...lesson,
            ...keyValue,
          };
        }
        return structuredClone(lesson);
      }),
    };
    this.setState(newState);
  };

  getLessonDetails = (index: number): ModifiableLesson => ({
    ...this.state.lessonData[index],
    colorIndex: 0,
    moduleCode: appendCustomIdentifier(this.state.moduleCode),
    title: this.state.moduleTitle,
    isCustom: true,
  });

  getValidationErrors = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Validate module code first, then each lesson data
    if (this.state.moduleCode.length === 0) {
      errors.moduleCode = 'Module code is required';
    }

    const effectiveModuleCode = appendCustomIdentifier(this.state.moduleCode);

    // If editing, new code must either be same as old code, or not already added
    if (this.props.isEdit) {
      if (
        effectiveModuleCode !== this.props.moduleCode &&
        this.props.isModuleCodeAdded(effectiveModuleCode)
      ) {
        errors.moduleCode = 'Module code is already added';
      }
    }
    // If adding, new code must not already be added
    else if (this.props.isModuleCodeAdded(effectiveModuleCode)) {
      errors.moduleCode = 'Module code is already added';
    }

    if (Object.keys(errors).length > 0) {
      return errors;
    }

    // Validate each lesson data
    for (let i = 0; i < this.state.maxIndex; i++) {
      const { startTime, endTime, classNo, weeks } = this.state.lessonData[i];

      if (classNo.length === 0) {
        errors.classNo = 'Class number is required';
      }

      if (isSpecialTerm(this.props.semester)) {
        const weekRange = weeks as WeekRange;
        const start = parseISO(weekRange.start);
        const end = parseISO(weekRange.end);

        if (end < start) {
          errors.weeks = 'End date must be after start date';
        }
      } else if ((weeks as NumericWeeks).length === 0) {
        errors.weeks = 'Weeks are required. Select all to indicate every week';
      }

      const timeDifferenceInMinutes =
        (getLessonTimeHours(endTime) - getLessonTimeHours(startTime)) * 60 +
        (getLessonTimeMinutes(endTime) - getLessonTimeMinutes(startTime));

      // -1 to account for n-1 minutes being valid
      if (timeDifferenceInMinutes < MINIMUM_CUSTOM_MODULE_DURATION_MINUTES - 1) {
        errors.time = `Lesson must be ${MINIMUM_CUSTOM_MODULE_DURATION_MINUTES} mins or longer`;
      }

      if (Object.keys(errors).length > 0) {
        this.setState({ selectedIndex: i });
        return errors;
      }
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

    const { moduleCode } = this.state;
    const { isEdit, handleCustomModule, moduleCode: oldModuleCode } = this.props;

    const customModuleCode = appendCustomIdentifier(moduleCode);

    if (isEdit) {
      handleCustomModule(
        oldModuleCode ?? '',
        customModuleCode,
        this.state.moduleTitle,
        this.state.lessonData,
      );
    } else {
      handleCustomModule('', customModuleCode, this.state.moduleTitle, this.state.lessonData);
    }
    this.resetState();
    this.props.closeModal();
    this.setState({
      isSubmitting: false,
    });
  }

  renderTimeRanges(field: 'startTime' | 'endTime') {
    const errors = this.state.isSubmitting ? this.getValidationErrors() : {};

    const value =
      field === 'startTime'
        ? this.state.lessonData[this.state.selectedIndex].startTime
        : this.state.lessonData[this.state.selectedIndex].endTime;

    // Generate timeslots in 30 minute intervals
    let startIndex = 0;
    let numberIntervals =
      (24 * 60 - MINIMUM_CUSTOM_MODULE_DURATION_MINUTES) / INTERVAL_IN_MINUTES + 1;
    if (field === 'endTime') {
      const NUMBER_SLOT_MIN_DURATION = MINIMUM_CUSTOM_MODULE_DURATION_MINUTES / INTERVAL_IN_MINUTES;
      startIndex =
        (getLessonTimeHours(this.state.lessonData[this.state.selectedIndex].startTime) * 60 +
          getLessonTimeMinutes(this.state.lessonData[this.state.selectedIndex].startTime)) /
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
      timeslots = timeslots.filter(
        (time) => time > this.state.lessonData[this.state.selectedIndex].startTime,
      );
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
          if (
            field === 'startTime' &&
            this.state.lessonData[this.state.selectedIndex].endTime < time
          ) {
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
            lesson={this.getLessonDetails(this.state.selectedIndex)}
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
            lesson={this.getLessonDetails(this.state.selectedIndex)}
            showTitle={false}
            hoverLesson={undefined}
            onHover={noop}
            transparent={false}
          />
        </div>
      </div>
    );
  }

  renderSlotSelector(semester: Semester) {
    if (!Semesters.includes(semester)) throw new Error('Invalid semester');

    return (
      <>
        <CustomModuleModalSlotSelector
          options={Array(this.state.maxIndex)
            .fill(0)
            .map((_, i) => i + 1)}
          selected={[this.state.selectedIndex + 1]}
          setSelected={(selected) => this.setState({ selectedIndex: selected[0] - 1 })}
          addButtonHandler={() =>
            this.setState((state) => ({
              selectedIndex: state.maxIndex,
              maxIndex: state.maxIndex + 1,
              lessonData: [...state.lessonData, this.DEFAULT_LESSON_STATE],
            }))
          }
          deleteButtonHandler={() => {
            if (this.state.maxIndex === 1) return;
            const newLessonData = this.state.lessonData.filter(
              (_, i) => i !== this.state.selectedIndex,
            );
            this.setState((state) => ({
              selectedIndex: Math.min(state.selectedIndex, state.maxIndex - 2),
              maxIndex: state.maxIndex - 1,
              lessonData: newLessonData,
            }));
          }}
        />
      </>
    );
  }

  renderWeekSelector(semester: Semester, weekErrors: string) {
    if (!Semesters.includes(semester)) throw new Error('Invalid semester');

    const { weeks } = this.state.lessonData[this.state.selectedIndex];

    if (!isSpecialTerm(semester)) {
      return (
        <>
          <label htmlFor="select-weeks">Weeks</label>
          <br />
          <CustomModuleModalWeekButtonSelector
            selected={weeks as NumericWeeks}
            setSelected={(selectedWeeks: number[]) =>
              this.setLessonStateViaSelect({ weeks: selectedWeeks })
            }
            error={weekErrors}
            options={getDefaultWeeks(this.props.semester) as NumericWeeks}
          />
        </>
      );
    }

    // Special term displays start/end date with week interval
    return (
      <>
        <label htmlFor="select-weeks">Weeks</label>
        <br />
        <CustomModuleModalWeekRangeSelector
          defaultWeekRange={(weeks ?? getDefaultWeeks(this.props.semester)) as WeekRange}
          onChange={(updatedWeeks) => this.setLessonStateViaSelect({ weeks: updatedWeeks })}
          error={weekErrors}
        />
      </>
    );
  }

  renderInputFields() {
    const { moduleCode, moduleTitle } = this.state;
    const { classNo } = this.state.lessonData[this.state.selectedIndex];
    const errors = this.state.isSubmitting ? this.getValidationErrors() : {};

    return (
      <>
        <div className={styles.row}>
          <div className={styles.column}>
            <CustomModuleModalField
              id="moduleCode"
              label="Module Code"
              errors={errors}
              value={moduleCode}
              onChange={this.setModuleCode}
            />
          </div>
          <div className={styles.column}>
            <CustomModuleModalField
              id="title"
              label="Title"
              errors={errors}
              value={moduleTitle}
              onChange={this.setModuleTitle}
            />
          </div>
        </div>
        <hr />
        <div className={styles.row}>
          <div className={classNames(styles.slotContainer, styles.column)}>
            {this.renderSlotSelector(this.props.semester)}
          </div>
        </div>
        <hr />
        {this.renderModulePreview()}
        <div className={styles.row}>
          <div className={styles.column}>
            <CustomModuleModalField
              id="classNo"
              label="Class Number"
              errors={errors}
              value={classNo || ''}
              onChange={this.setLessonStateViaInput}
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
              value={this.state.lessonData[this.state.selectedIndex].lessonType}
            />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.columnLarge}>
            <CustomModuleModalField
              id="venue"
              label="Venue"
              errors={errors}
              value={this.state.lessonData[this.state.selectedIndex].venue}
              onChange={this.setLessonStateViaInput}
            />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.columnSmall}>
            <label htmlFor="select-day">Day</label>
            <br />
            <CustomModuleModalDropdown
              options={SCHOOLDAYS.map((d) => d)}
              defaultSelectedOption={this.state.lessonData[this.state.selectedIndex].day}
              onChange={(d) => this.setLessonStateViaSelect({ day: d })}
              error={errors.day}
              value={this.state.lessonData[this.state.selectedIndex].day}
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
            {this.renderWeekSelector(this.props.semester, errors.weeks)}
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
      <Modal
        isOpen={this.props.isOpen}
        onAfterOpen={this.resetState}
        onRequestClose={this.props.closeModal}
        animate
      >
        <CloseButton absolutePositioned onClick={this.props.closeModal} />
        <div className={styles.header}>
          <h3>{this.props.isEdit ? <>Edit Custom Module</> : <>Add Custom Module</>}</h3>
          {this.renderInputFields()}
        </div>
      </Modal>
    );
  }
}
