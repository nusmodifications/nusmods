// @flow

import React from 'react';
import _ from 'lodash';
import config from 'config';
import type { SemesterData, Day, Time } from 'types/modules';
import { getFirstAvailableSemester, formatExamDate } from 'utils/modules';
import ButtonGroupSelector from 'views/components/ButtonGroupSelector';
import TimeslotTable from './TimeslotTable';

const semesterNames = config.shortSemesterNames;

type Props = {
  semesters: SemesterData[],
};

export default class ModuleSemesterInfo extends React.Component {
  props: Props;

  state: {
    selected: string,
  };

  constructor(props: Props) {
    super(props);

    const selectedSem = getFirstAvailableSemester(this.props.semesters);
    this.state = {
      selected: semesterNames[selectedSem],
    };
  }

  semesterMap(): { [string]: ?SemesterData } {
    const map = {};
    const { semesters } = this.props;

    _.each(semesterNames, (name: string, semester: string) => {
      map[name] = semesters.find(data => String(data.Semester) === semester);
    });

    return map;
  }

  buttonAttrs() {
    const semesterMap = this.semesterMap();
    const attrs = {};
    _.each(semesterNames, (name: string) => {
      if (!semesterMap[name]) attrs[name] = { disabled: true };
    });

    return { attrs };
  }

  selectedSemester(): ?SemesterData {
    return this.semesterMap()[this.state.selected];
  }

  timeslotChildren(day: Day, time: Time): React.Component {
    const semester = this.selectedSemester() || {};
    const {
      LecturePeriods: lectures = [],
      TutorialPeriods: tutorials = [],
    } = semester;

    const timeslot = `${day} ${time}`;
    const children = [];
    if (lectures.includes(timeslot)) children.push(<div className="workload-lecture-bg" />);
    if (tutorials.includes(timeslot)) children.push(<div className="workload-tutorial-bg" />);
    return children;
  }

  showTimeslots() {
    const semester = this.selectedSemester();
    if (!semester) return false;
    return !_.isEmpty(semester.LecturePeriods) || !_.isEmpty(semester.TutorialPeriods);
  }

  selectSemester(selected: string) {
    this.setState({ selected });
  }

  render() {
    const { selected } = this.state;
    const semesterMap = this.semesterMap();
    const semester = this.selectedSemester();

    return (
      <div className="module-semester-container">
        <ButtonGroupSelector
          {...this.buttonAttrs()}
          size="sm"
          choices={Object.keys(semesterMap)}
          selectedChoice={selected}
          onChoiceSelect={choice => this.selectSemester(choice)}
        />

        {semester && <div className="module-semester-info">
          { semester.ExamDate && <section className="module-exam">
            <h4>Exam</h4>
            { formatExamDate(semester.ExamDate) }
          </section>}

          { this.showTimeslots() && <section className="module-timeslots">
            <h4>Timetable</h4>
            <TimeslotTable>{({ day, time }) => this.timeslotChildren(day, time)}</TimeslotTable>
          </section>}
        </div>}
      </div>
    );
  }
}
