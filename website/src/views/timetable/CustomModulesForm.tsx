import * as React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { addModule, addCustomModule } from 'actions/timetables';
import {
  Days,
  Module,
  AcadYear,
  ModuleCode,
  ModuleTitle,
  Department,
  Faculty,
  Weeks,
  SemesterData,
  Semester,
} from 'types/modules';
import { State as StoreState } from 'types/state';
import CheckboxItem from 'views/components/filters/CheckboxItem';
import { LESSON_TYPE_ABBREV } from '../../utils/timetables';
import CustomModuleTimetableForm from './CustomModuleTimetableForm'
import styles from './CustomModulesForm.scss';

type OwnProps = {
  activeSemester: Semester;
};

type Props = OwnProps & {
  addModule: (semester: Semester, moduleCode: ModuleCode) => void;
  addCustomModule: (semester: Semester, moduleCode: ModuleCode, module: Module) => void;
}

const hours = [
  '0800',
  '0830',
  '0900',
  '0930',
  '1000',
  '1030',
  '1100',
  '1130',
  '1200',
  '1230',
  '1300',
  '1330',
  '1400',
  '1430',
  '1500',
  '1530',
  '1600',
  '1630',
  '1700',
  '1730',
  '1800',
  '1830',
  '1900',
  '1930',
  '2000',
  '2030',
  '2100',
  '2130',
  '2200',
  '2230',
  '2300',
  '2330',
  '2400',
];

export type ModuleClass = {
  acadYear: AcadYear;
  moduleCode: ModuleCode;
  title: ModuleTitle;
  department: Department;
  faculty: Faculty;
  moduleCredit: string;
  semester: Semester;
  classNo: string;
  startTime: string;
  endTime: string;
  weeks: Weeks;
  venue: string;
  day: string;
  lessonType: string;
  timestamp: number;
};

type State = ModuleClass;

class CustomModulesForm extends React.Component<Props, State> {
  state: State = {
    acadYear: '',
    moduleCode: '',
    title: '',
    moduleCredit: '1',
    department: '',
    faculty: '',
    semester: this.props.activeSemester,
    classNo: '',
    startTime: '0800',
    endTime: '1000',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    venue: '',
    day: 'Monday',
    lessonType: '',
    timestamp: Date.now(),
  };

  onSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    const semesterOneData = {
      semester: this.state.semester,
      timetable: [
        {
          classNo: this.state.classNo,
          startTime: this.state.startTime,
          endTime: this.state.endTime,
          weeks: this.state.weeks,
          venue: this.state.venue,
          day: this.state.day,
          lessonType: this.state.lessonType,
        },
      ],
      examDate: '',
      examDuration: 0,
    };

    const customModule: Module = {
      acadYear: this.state.acadYear,
      moduleCode: `${this.state.moduleCode}'`,
      title: this.state.title,
      moduleCredit: this.state.moduleCredit,
      department: this.state.department,
      faculty: this.state.faculty,
      timestamp: Date.now() || this.state.timestamp,
      semesterData: [semesterOneData],
    };
    this.props.addCustomModule(this.state.semester, customModule.moduleCode, customModule);
  };

  renderInputModuleCode = () => {
    return (
      <div className="form-group">
        <label htmlFor="module-code">Module Code</label>
        <input
          id="module-code"
          className={classnames(styles.input, styles.titleIcon)}
          onChange={(e) => this.setState({ moduleCode: e.target.value })}
          placeholder="Module Code"
          required
        />
      </div>
    );
  };

  renderInputModuleTitle = () => {
    return (
      <div className="form-group">
        <label htmlFor="module-title">Module Title</label>
        <input
          id="module-title"
          className={classnames(styles.input, styles.titleIcon)}
          onChange={(e) => this.setState({ title: e.target.value })}
          placeholder="Module Title"
          required
        />
      </div>
    );
  };

  renderInputModuleCredit = () => {
    return (
      <div className="form-group">
        <label htmlFor="module-credit">Module Credit</label>
        <select
          id="module-credit"
          className="form-control"
          value={this.state.moduleCredit}
          onChange={(e) => this.setState({ moduleCredit: e.target.value })}
        >
          {Array.from(Array(10), (_, i) => i + 1).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    );
  };

  formatTime = (item: string) => {
    if (item === '2400') {
      return '00:00';
    }
    return `${item.slice(0, 2)}:${item.slice(2, 4)}`;
  };

  renderDropdownStartTime = () => {
    return (
      <div className="form-group">
        <label htmlFor="start-time">Start Time</label>
        <select
          id="start-time"
          className="form-control"
          value={this.state.startTime}
          onChange={(e) => this.setState({ startTime: e.target.value })}
        >
          {hours.map((item) => (
            <option key={item} value={item}>
              {this.formatTime(item)}
            </option>
          ))}
        </select>
      </div>
    );
  };

  renderDropdownEndTime = () => {
    return (
      <div className="form-group">
        <label htmlFor="end-time">End Time</label>
        <select
          id="end-time"
          className="form-control"
          value={this.state.startTime}
          onChange={(e) => this.setState({ endTime: e.target.value })}
        >
          {hours
            .filter((item) => item > this.state.startTime)
            .map((item) => (
              <option key={item} value={item}>
                {this.formatTime(item)}
              </option>
            ))}
        </select>
      </div>
    );
  };

  renderDropdownLessonType = () => {
    return (
      <div className="form-group">
        <label htmlFor="lesson-type">Lesson Type</label>
        <select
          id="lesson-type"
          className="form-control"
          value={this.state.lessonType}
          onChange={(e) => this.setState({ lessonType: e.target.value })}
        >
          {Object.keys(LESSON_TYPE_ABBREV).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    );
  };

  renderInputClassNo = () => {
    return (
      <div className="form-group">
        <label htmlFor="module-code">Class No.</label>
        <input
          id="module-code"
          className={classnames(styles.input, styles.titleIcon)}
          onChange={(e) => this.setState({ classNo: e.target.value })}
          placeholder="Class No"
          required
        />
      </div>
    );
  };

  renderInputVenue = () => {
    return (
      <div className="form-group">
        <label htmlFor="module-code">Venue</label>
        <input
          id="module-code"
          className={classnames(styles.input, styles.titleIcon)}
          onChange={(e) => this.setState({ venue: e.target.value })}
          placeholder="Venue"
          required
        />
      </div>
    );
  };

  renderDropdownDay = () => {
    return (
      <div className="form-group">
        <label htmlFor="day">Day</label>
        <select
          id="day"
          className="form-control"
          value={this.state.day}
          onChange={(e) => this.setState({ day: e.target.value })}
        >
          {Days.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    );
  };



  /*
  renderChecklistWeeks = () => (
    Array.from(Array(13), (_, i) => i + 1).map((item) => (
      <CheckboxItem
        onClick={() => this.onSelectWeek(item)}
        active
        itemKey={`${item}`}
        label={`${item}`}
        count={0}
        showCount={false}
        disabled={false}
      />
    ))
  )
  */



  isFormValid = () => {
    const validity = Boolean(
      this.state.moduleCode &&
        this.state.title &&
        this.state.classNo &&
        this.state.startTime.length === 4 &&
        this.state.endTime.length === 4 &&
        this.state.startTime < this.state.endTime &&
        this.state.venue &&
        this.state.day &&
        this.state.lessonType,
    );
    return validity;
  };

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <div className={styles.search}>
          <div
            className={styles.formGroup}
            role="group"
            aria-label="Custom module main information"
          >
            {this.renderInputModuleCode()}
            {this.renderInputModuleTitle()}
            {this.renderInputModuleCredit()}
            {this.renderDropdownLessonType()}
            {this.renderInputClassNo()}
            {this.renderInputVenue()}
            {this.renderDropdownDay()}
            {this.renderDropdownStartTime()}
            {this.renderDropdownEndTime()}
          </div>
          <input
            type="submit"
            value="Create Module"
            className={classnames(styles.titleBtn, 'btn-outline-primary btn btn-svg')}
          />
        </div>
      </form>
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  return {
    activeSemester: state.app.activeSemester,
  };
};
export default connect(mapStateToProps, { addModule, addCustomModule })(CustomModulesForm);
