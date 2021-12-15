import * as React from 'react';

import CloseButton from 'views/components/CloseButton';
import Modal from 'views/components/Modal';
import {
  LessonDays,
  Module,
  ModuleCode,
} from 'types/modules';
import styles from './CustomModuleModal.scss';
import TimetableCell from './TimetableCell';
import { LESSON_TYPE_ABBREV } from 'utils/timetables';
import { Lesson, ModifiableLesson } from 'types/timetables';
import { appendCustomIdentifier, cretaeCustomModule, removeCustomIdentifier } from 'utils/custom';
import { getLessonTimeHours, getLessonTimeMinutes } from 'utils/timify';

export type Props = {
  customLessonData?: Lesson; 
  isOpen: boolean; 
  isEdit: boolean;  

  handleCustomModule: (moduleCode: ModuleCode, module: Module, lesson: Lesson) => void; 
  closeModal: () => void;
};

type State = {
  lessonData: Lesson; 
  isSubmitting: boolean; 
};

const defaultLessonState: Lesson = {
  moduleCode: "", 
  title: "", 
  lessonType: "Design Lecture", 
  venue: "", 
  day: "Monday", 
  startTime: "0800", 
  endTime: "0900", 
  classNo: "01", 
  isCustom: true, 
  weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 
};

export default class CustomModuleModal extends React.PureComponent<Props, State> {
  fields = ['moduleCode', 'title', 'lessonType', 'venue', 'day', 'startTime', 'endTime'];

  state: State = {
    lessonData: {
      ...this.props.customLessonData || defaultLessonState,
      moduleCode: this.props.customLessonData ? 
        removeCustomIdentifier(this.props.customLessonData.moduleCode)
        : ''
    }, 
    isSubmitting: false
  };

  setLessonState = (event: any) => {
    const newState: any = { lessonData: { 
      ...this.state.lessonData, 
      [event.target.name]: event.target.value 
    }};
    this.setState(newState);
  }

  getLessonDetails = (): ModifiableLesson => {
    return {
      ...this.state.lessonData, 
      colorIndex: 0, 
    }
  }

  getValidatioNErrors = (): string[] => {
    const { moduleCode, title, venue, startTime, endTime } = this.state.lessonData ;
    const errors: string[] = [];
    
    if (moduleCode.length == 0) {
      errors.push("Please Enter a Module Code.");
    }

    if (title.length == 0) {
      errors.push("Please Enter a Title.");
    }

    if (venue.length == 0) {
      errors.push("Please Enter a Venue.");
    }

    const timeDifferenceInMinutes = 
      (getLessonTimeHours(endTime) - getLessonTimeHours(startTime)) * 60 
      + (getLessonTimeMinutes(endTime) - getLessonTimeMinutes(startTime));

    if (timeDifferenceInMinutes < 60) {
      errors.push("Start and End Time must be at least 1 hour apart.");
    }

    return errors; 
  }

  submitModule() {
    const errors = this.getValidatioNErrors();

    if (errors.length > 0) {
      this.setState({
        isSubmitting: true, 
      });
      return; 
    }

    const { moduleCode, title } = this.state.lessonData;
    const { isEdit, handleCustomModule, customLessonData } = this.props;

    const customModuleCode = appendCustomIdentifier(moduleCode);

    const submittedLessonData = {
      ...this.state.lessonData, 
      moduleCode: customModuleCode
    };

    const module: Module = cretaeCustomModule(customModuleCode, title);

    if (isEdit) {
        handleCustomModule!(customLessonData!.moduleCode, module, submittedLessonData);
    } else {
        handleCustomModule!(module.moduleCode, module, submittedLessonData);
        this.setState({
          lessonData: defaultLessonState, 
        });
    }
    this.props.closeModal();
    this.setState({
      isSubmitting: false
    });
  }

  renderLessonTypes() {
    const { lessonType } = this.state.lessonData; 

    return (
      <select name={"lessonType"} id={"select-lessonType"} onChange={this.setLessonState} value={lessonType}>
        {Object.keys(LESSON_TYPE_ABBREV).map((lessonType: string) => {
          return <option key={lessonType} value={lessonType}>{lessonType}</option>; 
        })}
    </select>
    );
  }

  renderWorkingDays() {
    const { day } = this.state.lessonData; 

    return (
      <select name={"day"} id={"select-day"} onChange={this.setLessonState} value={day}>
        {LessonDays.map((day: string) => {
          return <option key={day} value={day}>{day}</option>; 
        })}
    </select>
    );
  }

  renderTimeRanges(field: string) {
    const minTimeInHalfHours = 15;
    const numberOfTimeSlots = 28;

    const value = (field === "startTime" ? this.state.lessonData.startTime : this.state.lessonData.endTime);
    const timeslots = Array.from({length: numberOfTimeSlots}, (_, i) => i + 1);

    return (
      <select name={field} id={`select-${field}`} onChange={this.setLessonState} value={value}>
        {timeslots.map((timeslot: number) => {
          timeslot = ((minTimeInHalfHours + timeslot) * 30);
          const hourString = Math.floor(timeslot / 60).toString().padStart(2, '0') 
          const minuteString = (timeslot % 60).toString().padStart(2, '0');
          const timeString = hourString + minuteString;
          return <option key={`${field}-${timeString}`} value={timeString}>{timeString}</option>; 
        })}
    </select>
    )
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
          showTitle={true}
          hoverLesson={undefined}
          onHover={() => {}}
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
          onHover={() => {}}
          transparent={false}
        />
      </div>
    </div>
    );
  }

  renderInputFields() {
    const { moduleCode, title, venue} = this.state.lessonData;

    return (
      <>
        <div className={styles.row}>
          <div className={styles.column}>
            <label htmlFor="select-moduleCode">Module Code</label>
            <input
              name="moduleCode"
              onChange={this.setLessonState}
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
              onChange={this.setLessonState}
              id="select-title"
              className="form-control"
              defaultValue={title || ''}
              required
            />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.columnLarge}>
            <label htmlFor="select-lessonType">Lesson Type</label>
            <br/>
            {this.renderLessonTypes()}
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.columnLarge}>
            <label htmlFor="select-venue">Venue</label>
            <input
              name="venue"
              onChange={this.setLessonState}
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
            <br/>
            {this.renderTimeRanges("startTime")}
          </div>
          <div className={styles.columnSmall}>
            <label htmlFor="select-endTime">End Time</label>
            <br/>
            {this.renderTimeRanges("endTime")}
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.buttonColumn}>
            <button
              type="button"
              className="btn btn-outline-primary btn-svg"
              onClick={(e) => this.submitModule()}
              onMouseOver={() => {}}
              onFocus={() => {}}
            >
              {this.props.isEdit ? <>Edit Custom Module</> : <>Add Custom Module</>}
            </button>
          </div>
        </div>
      </>
    );
  }

  renderErrors() {
    const errors = this.getValidatioNErrors();

    return (
        <div className="alert alert-danger">
          {errors.map(error => 
            (<>{error}<br/></>)
          )}
        </div>
      ) 
  }

  render() {
    const { isSubmitting } = this.state;  

    return (
    <Modal isOpen={this.props.isOpen} onRequestClose={this.props.closeModal} animate>
        <CloseButton absolutePositioned onClick={this.props.closeModal} />
        <div className={styles.header}>
        <h3>{this.props.isEdit ? <>Edit Custom Module</> : <>Add a Custom Module</>}</h3>
        <p>
            For DYOM students, teaching assistants, etc. who just need that one special slot on
            your timetable, we got you covered!
        </p>
        {isSubmitting && this.renderErrors()}
        {this.renderModulePreview()}
        {this.renderInputFields()}
        </div>
    </Modal>
    );
  }
}
