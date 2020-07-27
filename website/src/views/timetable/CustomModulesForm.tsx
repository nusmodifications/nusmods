import * as React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { addModule, addCustomModule } from 'actions/timetables';
import {
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
import CustomModuleTimetableForm from './CustomModuleTimetableForm'
import styles from './CustomModulesForm.scss';

type OwnProps = {
  activeSemester: Semester;
};

type Props = OwnProps & {
  addModule: (semester: Semester, moduleCode: ModuleCode) => void;
  addCustomModule: (semester: Semester, moduleCode: ModuleCode, module: Module) => void;
}

type State = {
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
  currentTimetableIndex: number;
  timestamp: number;
};

class CustomModulesForm extends React.Component<Props, State> {
  state: State = {
    acadYear: '',
    moduleCode: '',
    title: '',
    moduleCredit: '',
    department: '',
    faculty: '',
    semester: this.props.activeSemester,
    classNo: '',
    startTime: '',
    endTime: '',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    venue: '',
    day: '',
    lessonType: '',
    currentTimetableIndex: 0,
    timestamp: Date.now(),
  };

  onSubmit = (evt: React.SyntheticEvent<HTMLButtonElement, MouseEvent>) => {
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
          size: 20,
        },
      ],
      examDate: '',
      examDuration: 0,
    };

    const customModule: Module = {
      acadYear: this.state.acadYear,
      moduleCode: this.state.moduleCode,
      title: this.state.title,
      moduleCredit: this.state.moduleCredit,
      department: this.state.department,
      faculty: this.state.faculty,
      timestamp: Date.now() || this.state.timestamp,
      semesterData: [semesterOneData,],
    };
    this.props.addCustomModule(this.state.semester, customModule.moduleCode, customModule);
  };

  onChangeClassNo = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ classNo: event.target.value });
  };

  onSelectStartTime = (item: string, type: string) => {
    this.setState((prevState) => ({
      startTime:
        type === 'HH'
          ? item + prevState.startTime.slice(-2, 0)
          : prevState.startTime.slice(0, 2) + item,
    }));
  };

  onSelectEndTime = (item: string, type: string) => {
    this.setState((prevState) => ({
      endTime:
        type === 'HH'
          ? item + prevState.endTime.slice(-2, 0)
          : prevState.endTime.slice(0, 2) + item,
    }));
  };

  onChangeVenue = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ venue: event.target.value });
  };

  onSelectDay = (item: string) => {
    this.setState({ day: item });
  };

  onSelectLessonType = (item: string) => {
    this.setState({ lessonType: item });
  };

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
      <div>
        <div
          className={styles.buttonGroup}
          role="group"
          aria-label="Custom module main information"
        >
          <input
            className={classnames(styles.input, styles.titleIcon)}
            onChange={(e) => this.setState({ moduleCode: e.target.value })}
            placeholder="Module Code"
          />
          <input
            className={classnames(styles.input, styles.titleIcon)}
            onChange={(e) => this.setState({ title: e.target.value })}
            placeholder="Module Title"
          />
        </div>
        <CustomModuleTimetableForm
          index={this.state.currentTimetableIndex}
          onChangeClassNo={this.onChangeClassNo}
          onSelectStartTime={this.onSelectStartTime}
          onSelectEndTime={this.onSelectEndTime}
          onChangeVenue={this.onChangeVenue}
          onSelectDay={this.onSelectDay}
          onSelectLessonType={this.onSelectLessonType}
        />
        <button
          type="button"
          disabled={!this.isFormValid()}
          className={classnames(styles.titleBtn, 'btn-outline-primary btn btn-svg')}
          onClick={this.onSubmit}
        >
          Create Module
        </button>
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  return {
    activeSemester: state.app.activeSemester,
  };
};
export default connect(mapStateToProps, { addModule, addCustomModule })(CustomModulesForm);
