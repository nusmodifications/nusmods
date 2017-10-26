// @flow
import type { Node } from 'react';

import React, { Component } from 'react';
import _ from 'lodash';

import type { Semester, SemesterData } from 'types/modules';

import { getFirstAvailableSemester, formatExamDate } from 'utils/modules';
import SemesterPicker from './SemesterPicker';
import TimeslotTable from './TimeslotTable';

type Props = {
  semesters: SemesterData[],
};

type State = {
  selected: Semester,
};

export default class ModuleSemesterInfo extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { selected: getFirstAvailableSemester(this.props.semesters) };
  }

  onSelectSemester = (selected: ?Semester) => {
    if (selected) {
      this.setState({ selected });
    }
  };

  selectedSemester(): ?SemesterData {
    return this.props.semesters.find(data => data.Semester === this.state.selected);
  }

  timeslotChildren(): Map<string, Node[]> {
    const semester = this.selectedSemester() || {};
    const {
      LecturePeriods: lectures = [],
      TutorialPeriods: tutorials = [],
    } = semester;

    const children = new Map();
    const addChild = (timeslot, component) => {
      if (!children.has(timeslot)) children.set(timeslot, []);
      const child = children.get(timeslot) || [];
      child.push(component);
    };

    lectures.forEach(timeslot => addChild(timeslot, <div className="workload-lecture-bg" key="lecture" />));
    tutorials.forEach(timeslot => addChild(timeslot, <div className="workload-tutorial-bg" key="tutorial" />));

    return children;
  }

  showTimeslots() {
    const semester = this.selectedSemester();
    if (!semester) return false;
    return !_.isEmpty(semester.LecturePeriods) || !_.isEmpty(semester.TutorialPeriods);
  }

  render() {
    const semester = this.selectedSemester();
    const semesters = this.props.semesters.map(data => data.Semester);

    return (
      <div className="module-semester-container">
        <SemesterPicker
          semesters={semesters}
          selectedSemester={this.state.selected}
          size="sm"
          onSelectSemester={this.onSelectSemester}
          useShortNames
          showDisabled
        />

        {semester && <div className="module-semester-info">
          { semester.ExamDate && <section className="module-exam">
            <h4>Exam</h4>
            { formatExamDate(semester.ExamDate) }
          </section>}

          { this.showTimeslots() && <section className="module-timeslots">
            <h4>Timetable</h4>
            <TimeslotTable>{ this.timeslotChildren() }</TimeslotTable>
          </section>}
        </div>}
      </div>
    );
  }
}
