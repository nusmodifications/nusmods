import * as React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { addModule, addCustomModule } from 'actions/timetables';
import { Days, Module, ModuleCode, ModuleTitle, Semester } from 'types/modules';
import { State as StoreState } from 'types/state';
import { LESSON_TYPE_ABBREV } from '../../utils/timetables';
import styles from './CustomModulesForm.scss';

type OwnProps = {
  activeSemester: Semester;
};

type Props = OwnProps & {
  addModule: (semester: Semester, moduleCode: ModuleCode) => void;
  addCustomModule: (semester: Semester, moduleCode: ModuleCode, module: Module) => void;
};

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
  moduleCode: ModuleCode;
  title: ModuleTitle;
  moduleCredit: string;
  classNo: string;
  startTime: string;
  endTime: string;
  venue: string;
  day: string;
  lessonType: string;
};

type State = ModuleClass;

class CustomModulesForm extends React.PureComponent<Props, State> {
  state: State = {
    moduleCode: '',
    title: '',
    moduleCredit: '4',
    classNo: '',
    startTime: '0800',
    endTime: '1000',
    venue: '',
    day: 'Monday',
    lessonType: 'Lecture',
  };

  onSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const semesterDatum = {
      semester: this.props.activeSemester,
      timetable: [
        {
          classNo: this.state.classNo,
          startTime: this.state.startTime,
          endTime: this.state.endTime,
          weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
          venue: this.state.venue,
          day: this.state.day,
          lessonType: this.state.lessonType,
        },
      ],
    };

    const customModule: Module = {
      acadYear: '',
      moduleCode: `${this.state.moduleCode}'`,
      title: this.state.title,
      moduleCredit: this.state.moduleCredit,
      department: '',
      faculty: '',
      timestamp: Date.now(),
      semesterData: [semesterDatum],
    };
    this.props.addCustomModule(semesterDatum.semester, customModule.moduleCode, customModule);
  };

  renderInputModuleCode = () => {
    return (
      <div className="form-group">
        <label htmlFor="module-code-custom-module">Module Code</label>
        <input
          id="module-code-custom-module"
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
        <label htmlFor="module-title-custom-module">Module Title</label>
        <input
          id="module-title-custom-module"
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
        <label htmlFor="module-credit-custom-module">Module Credit</label>
        <input
          id="module-credit-custom-module"
          className="form-control"
          value={this.state.moduleCredit}
          onChange={(e) => this.setState({ moduleCredit: e.target.value })}
          type="number"
          step="1"
          min="0"
        />
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
        <label htmlFor="start-time-custom-module">Start Time</label>
        <select
          id="start-time-custom-module"
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
        <label htmlFor="end-time-custom-module">End Time</label>
        <select
          id="end-time-custom-module"
          className="form-control"
          value={this.state.endTime}
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
        <label htmlFor="lesson-type-custom-module">Lesson Type</label>
        <select
          id="lesson-type-custom-module"
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
        <label htmlFor="class-no-custom-module">Class No.</label>
        <input
          id="class-no-custom-module"
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
        <label htmlFor="venue-custom-module">Venue</label>
        <input
          id="venue-custom-module"
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
        <label htmlFor="day-custom-module">Day</label>
        <select
          id="day-custom-module"
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
          <button
            type="submit"
            className={classnames(styles.submitBtn, 'btn-outline-primary btn btn-svg')}
          >
            Create Module
          </button>
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
