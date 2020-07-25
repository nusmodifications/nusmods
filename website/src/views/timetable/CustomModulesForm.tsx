import * as React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { addModule } from 'actions/timetables';
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
  // Own props
  activeSemester: Semester;
};

type Props = OwnProps & {
  addModule: (semester: Semester, moduleCode: ModuleCode) => void;
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


const semesterOneData = {
  semester: 1,
  timetable: [
    {
      classNo: 'A1',
      startTime: '1400',
      endTime: '1700',
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      venue: 'UTSRC-LT51',
      day: 'Thursday',
      lessonType: 'Sectional Teaching',
      size: 20,
    },
  ],
  examDate: '2018-12-06T13:00:00.000+08:00',
  examDuration: 120,
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
    weeks: [],
    venue: '',
    day: '',
    lessonType: '',
    currentTimetableIndex: 0,
    timestamp: Date.now(),
  };

  onSubmit = (evt: React.SyntheticEvent<HTMLButtonElement, MouseEvent>) => {
    evt.preventDefault();
    let customModule: Module = {
      acadYear: this.state.acadYear,
      moduleCode: this.state.moduleCode,
      title: this.state.title,
      moduleCredit: this.state.moduleCredit,
      department: this.state.department,
      faculty: this.state.faculty,
      timestamp: Date.now() || this.state.timestamp,
      semesterData: [],
    };
    customModule = {
      acadYear: '2018/2019',
      description: 'This course aims to help students understand the role of information...',
      preclusion: 'Students who have passed FNA1006',
      faculty: 'Business',
      department: 'Accounting',
      title: 'Accounting Information Systems',
      workload: [0, 3, 0, 4, 3],
      prerequisite: 'FNA1002 or ACC1002',
      moduleCredit: '4',
      moduleCode: 'MA1101R',
      semesterData: [semesterOneData],
      timestamp: Date.now(),
    };
    this.state.currentTimetableIndex += 1;
    this.props.addModule(1, customModule.moduleCode);
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
        {this.state.weeks}
        {this.state.semester}
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  return {
    activeSemester: state.app.activeSemester,
  };
};
export default connect(mapStateToProps, { addModule })(CustomModulesForm);
