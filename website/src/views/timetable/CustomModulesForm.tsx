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
  semesterData: SemesterData[];
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
    semesterData: [
      {
        semester: this.props.activeSemester,
        timetable: [
          {
            classNo: '',
            startTime: '',
            endTime: '',
            weeks: [],
            venue: '',
            day: '',
            lessonType: '',
          },
        ],
      },
    ],
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
      semesterData: this.state.semesterData,
      timestamp: Date.now() || this.state.timestamp,
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
    }
    this.state.currentTimetableIndex += 1;
    this.props.addModule(this.state.semesterData[0].semester, customModule.moduleCode);
  }
  
  onChangeClassNo = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    this.setState((prevState) => {
      return {
        semesterData: [{
          semester: prevState.semesterData[0].semester,
          timetable: prevState.semesterData[0].timetable.map((props, currentIndex) =>
            currentIndex === index ? { ...props, classNo: event.target.value } : props
          )
        }]
      }
    })
  };

  onSelectStartTime = (item: string, index: number) => {
    this.setState((prevState) => {
      return {
        semesterData: [{
          semester: prevState.semesterData[0].semester,
          timetable: prevState.semesterData[0].timetable.map((props, currentIndex) =>
            currentIndex === index ? { ...props, startTime: item } : props
          )
        }]
      }
    })
  };

  onSelectEndTime = (item: string, index: number) => {
    this.setState((prevState) => {
      return {
        semesterData: [{
          semester: prevState.semesterData[0].semester,
          timetable: prevState.semesterData[0].timetable.map((props, currentIndex) =>
            currentIndex === index ? { ...props, endTime: item } : props
          )
        }]
      }
    })
  };

  onSelectVenue = (item: string, index: number) => {
    this.setState((prevState) => {
      return {
        semesterData: [{
          semester: prevState.semesterData[0].semester,
          timetable: prevState.semesterData[0].timetable.map((props, currentIndex) =>
            currentIndex === index ? { ...props, venue: item } : props
          )
        }]
      }
    })
  };

  onSelectDay = (item: string, index: number) => {
    this.setState((prevState) => {
      return {
        semesterData: [{
          semester: prevState.semesterData[0].semester,
          timetable: prevState.semesterData[0].timetable.map((props, currentIndex) =>
            currentIndex === index ? { ...props, day: item } : props
          )
        }]
      }
    })
  };

  onSelectLessonType = (item: string, index: number) => {
    this.setState((prevState) => {
      return {
        semesterData: [{
          semester: prevState.semesterData[0].semester,
          timetable: prevState.semesterData[0].timetable.map((props, currentIndex) =>
            currentIndex === index ? { ...props, lessonType: item } : props
          )
        }]
      }
    })
  };

  isFormValid = () => {
    let validity: boolean = Boolean(this.state.moduleCode) && Boolean(this.state.title);
    this.state.semesterData[0].timetable.forEach(function (schedule) {
      validity = validity && Boolean(schedule.classNo && schedule.startTime && schedule.endTime && schedule.venue && schedule.day && schedule.lessonType)
    });
    console.log(validity);
    return validity;
  }

  render() {
    return (
      <div>
        <div className={styles.buttonGroup}>
        <input
          className={classnames(styles.input, styles.titleIcon)}
          onChange={e => this.setState({ moduleCode: e.target.value })}
          placeholder="Module Code"
        />
        <input
          className={classnames(styles.input, styles.titleIcon)}
          onChange={e => this.setState({ title: e.target.value })}
          placeholder="Module Title"
          />
        </div>
        <CustomModuleTimetableForm
          index={this.state.currentTimetableIndex}
          onChangeClassNo={this.onChangeClassNo}
          onSelectStartTime={this.onSelectStartTime}
          onSelectEndTime={this.onSelectEndTime}
          onSelectVenue={this.onSelectVenue}
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
export default connect(mapStateToProps, { addModule })(CustomModulesForm);
