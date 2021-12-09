import * as React from 'react';

import CloseButton from 'views/components/CloseButton';
import Modal from 'views/components/Modal';
import { PlusCircle } from 'react-feather';
import {
  Day,
  EndTime,
  LessonDays,
  LessonType,
  Module,
  ModuleCode,
  ModuleTitle,
  Semester,
  StartTime,
  Venue,
} from 'types/modules';
import styles from './CustomModuleSelect.scss';
import TimetableCell from './TimetableCell';
import { ColoredLesson } from 'types/timetables';
import { LESSON_TYPE_ABBREV } from 'utils/timetables';
import { addCustomModule } from 'actions/timetables';
import { connect } from 'react-redux';
import { getNewColor } from 'utils/colors';

export type Props = {
  semester: Semester;

  addCustomModule: (semester: Semester, moduleCode: ModuleCode, module: Module) => void; 
};

type State = {
  isOpen: boolean;
  moduleCode: ModuleCode;
  title: ModuleTitle;
  lessonType: LessonType;
  venue: Venue;
  day: Day;
  startTime: StartTime;
  endTime: EndTime;
};

export default class CustomModulesSelect extends React.PureComponent<Props, State> {
  fields = ['moduleCode', 'title', 'lessonType', 'venue', 'day', 'startTime', 'endTime'];

  state: State = {
    isOpen: false,
    moduleCode: "", 
    title: "", 
    lessonType: "Lecture", 
    venue: "", 
    day: "Monday", 
    startTime: "0800", 
    endTime: "0900"
  };

  setStateField = (event: any) => {
    const newState: any = { [event.target.name]: event.target.value };
    this.setState(newState);
  }

  openModal = () => {
    this.setState({ isOpen: true });
  };

  closeModal = () =>
    this.setState({
      isOpen: false,
    });

  getLessonDetails = () => {
    return {
      ...this.state, 
      classNo: "01", 
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      colorIndex: 0, 
    }
  }

  submitModule() {
    const module: Module = {
      ...this.state,
      isCustom: true,
      acadYear: '',
      moduleCredit: '',
      department: '',
      faculty: '',
      semesterData: [],
      timestamp: 0
    }
    console.log("a");
    
    this.props.addCustomModule(this.props.semester, this.state.moduleCode, module)
  }

  renderLessonTypes() {
    return (
      <select name={"lessonType"} id={"select-lessonType"} onChange={this.setStateField}>
        {Object.keys(LESSON_TYPE_ABBREV).map((lessonType: string) => {
          return <option key={lessonType} value={lessonType}>{lessonType}</option>; 
        })}
    </select>
    );
  }

  renderWorkingDays() {
    return (
      <select name={"day"} id={"select-day"} onChange={this.setStateField}>
        {LessonDays.map((day: string) => {
          return <option key={day} value={day}>{day}</option>; 
        })}
    </select>
    );
  }

  renderTimeRanges(field: string) {
    const minTimeInHalfHours = 15;
    const numberOfTimeSlots = 28;
    const timeslots = Array.from({length: numberOfTimeSlots}, (_, i) => i + 1);

    return (
      <select name={field} id={`select-${field}`} onChange={this.setStateField}>
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
    const { moduleCode, title, lessonType, venue, day, startTime, endTime } = this.state;

    return (
      <>
        <div className={styles.row}>
          <div className={styles.column}>
            <label htmlFor="select-moduleCode">Module Code</label>
            <input
              name="moduleCode"
              onChange={this.setStateField}
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
              onChange={this.setStateField}
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
              onChange={this.setStateField}
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
            {this.renderModulePreview()}
            {this.renderInputFields()}
          </div>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps() {
  return {};
}
