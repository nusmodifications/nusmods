import * as React from 'react';

import CloseButton from 'views/components/CloseButton';
import Modal from 'views/components/Modal';
import { Edit } from 'react-feather';
import {
  LessonDays,
  Module,
  ModuleCode,
} from 'types/modules';
import styles from './CustomModuleEdit.scss';
import TimetableCell from './TimetableCell';
import { LESSON_TYPE_ABBREV } from 'utils/timetables';
import { Lesson, ModifiableLesson } from 'types/timetables';
import Tooltip from 'views/components/Tooltip';
import classnames from 'classnames';

export type Props = {
  lesson: Lesson | undefined; 
  moduleActionStyle: string; 
  actionIconStyle: string; 

  editCustomModule: (moduleCode: ModuleCode, module: Module, lesson: Lesson) => void; 
};

type State = {
  isOpen: boolean;
  lessonData: Lesson; 
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
  weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 
};

export default class CustomModuleEdit extends React.PureComponent<Props, State> {
  fields = ['moduleCode', 'title', 'lessonType', 'venue', 'day', 'startTime', 'endTime'];

  state: State = {
    isOpen: false,
    lessonData: this.props.lesson || defaultLessonState, 
  };

  setLessonState = (event: any) => {
    const newState: any = { lessonData: { 
      ...this.state.lessonData, 
      [event.target.name]: event.target.value 
    }};
    this.setState(newState);
  }

  openModal = () => {
    this.setState({ isOpen: true });
  };

  closeModal = () =>
    this.setState({
      isOpen: false,
    });

  getLessonDetails = (): ModifiableLesson => {
    return {
      ...this.state.lessonData, 
      colorIndex: 0, 
    }
  }

  submitModule() {
    const { moduleCode, title } = this.state.lessonData; 

    const module: Module = {
      moduleCode: moduleCode, 
      title: title, 
      isCustom: true,
      acadYear: '',
      moduleCredit: '0',
      department: '',
      faculty: '',
      semesterData: [],
      timestamp: 0,
    }

    this.props.editCustomModule(module.moduleCode, module, this.state.lessonData);
    this.closeModal();
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
              disabled={true}
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
              disabled={true}
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
              Edit Custom Module
            </button>
          </div>
        </div>
      </>
    );
  }

  render() {
    const { isOpen } = this.state;

    return (
      <>
    <Modal isOpen={isOpen} onRequestClose={this.closeModal} animate>
        <CloseButton absolutePositioned onClick={this.closeModal} />
        <div className={styles.header}>
            <h3>Edit Custom Module</h3>
            <p>
            For DYOM students, teaching assistants, etc. who just need that one special slot on
            your timetable, we got you covered!
            </p>
            {this.renderModulePreview()}
            {this.renderInputFields()}
        </div>
    </Modal>
      <Tooltip content={"Edit Custom Module"} touch="hold">
        <button
          type="button"
          className={classnames('btn btn-outline-secondary btn-svg', this.props.moduleActionStyle)}
          aria-label={"Edit Custom Module"}
          onClick={this.openModal}
        >
          <Edit className={this.props.actionIconStyle} />  
        </button>
        
        </Tooltip>
      </>
    );
  }
}
