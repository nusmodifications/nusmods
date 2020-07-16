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
import styles from './CustomModulesForm.scss';

type Props = {
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

const semesterTwoData = {
  semester: 2,
  timetable: [
    {
      classNo: 'A1',
      startTime: '0900',
      endTime: '1200',
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      venue: 'BIZ2-0510',
      day: 'Monday',
      lessonType: 'Sectional Teaching',
      size: 20,
    },
    {
      classNo: 'A2',
      startTime: '1300',
      endTime: '1600',
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      venue: 'BIZ2-0510',
      day: 'Monday',
      lessonType: 'Sectional Teaching',
      size: 20,
    },
  ],
  examDate: '2019-05-09T13:00:00.000+08:00',
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
        semester: 1,
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
      semesterData: [semesterOneData, semesterTwoData],
      timestamp: Date.now(),
    }
    this.props.addModule(this.state.semesterData[0].semester, customModule.moduleCode);
  }

  render() {
    return (
      <div>
        <input
          className={classnames(styles.input)}
          onChange={e => this.setState({ moduleCode: e.target.value })}
          placeholder="Module Code"
        />
        <input
          className={classnames(styles.input)}
          onChange={e => this.setState({ title: e.target.value })}
          placeholder="Module Title"
        />
        <button
          type="button"
          className={classnames(styles.titleBtn, 'btn-outline-primary btn btn-svg')}
          onClick={this.onSubmit}
        >
          Create Module
        </button>

      </div>
    );
  }
}

function mapStateToProps() {
  return {};
}

export default connect(mapStateToProps, { addModule })(CustomModulesForm);
