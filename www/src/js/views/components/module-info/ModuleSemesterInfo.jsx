// @flow
import type { Node } from 'react';

import React, { Component } from 'react';
import _ from 'lodash';

import type { ModuleCode, Semester, SemesterData } from 'types/modules';

import { getFirstAvailableSemester, formatExamDate } from 'utils/modules';
import SemesterPicker from './SemesterPicker';
import TimeslotTable from './TimeslotTable';
import ModuleExamClash from './ModuleExamClash';

type Props = {
  moduleCode: ModuleCode,
  semesters: SemesterData[],
};

type State = {
  selected: Semester,
};

// Using a bitmask to indicate what the timeslot contains - lecture, tutorial, or both
type TimeslotFlag = number;
const HAS_LECTURE: TimeslotFlag = 1 << 0;
const HAS_TUTORIAL: TimeslotFlag = 1 << 1;

function getTimeslotContent(timeslot: string, flags: TimeslotFlag) {
  switch (flags) {
    case HAS_LECTURE:
      return (
        <div title={`This module has lectures on ${timeslot}`} className="workload-lecture-bg" />
      );

    case HAS_TUTORIAL:
      return (
        <div title={`This module has tutorials on ${timeslot}`} className="workload-tutorial-bg" />
      );

    case HAS_TUTORIAL | HAS_LECTURE:
    default:
      return (
        <div title={`This module has lectures and tutorials on ${timeslot}`}>
          <div className="workload-lecture-bg" />
          <div className="workload-tutorial-bg" />
        </div>
      );
  }
}

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
    return this.props.semesters.find((data) => data.Semester === this.state.selected);
  }

  timeslotChildren(): Map<string, Node> {
    const semester = this.selectedSemester() || {};
    const { LecturePeriods: lectures = [], TutorialPeriods: tutorials = [] } = semester;

    // Create a mapping of timeslot to flags
    const timeslots: Map<string, TimeslotFlag> = new Map();
    const setTimeslot = (timeslot, flag) =>
      timeslots.set(timeslot, (timeslots.get(timeslot) || 0) | flag);
    lectures.forEach((timeslot) => setTimeslot(timeslot, HAS_LECTURE));
    tutorials.forEach((timeslot) => setTimeslot(timeslot, HAS_TUTORIAL));

    // Then convert the flags to content
    const nodes = new Map();
    timeslots.forEach((flags, timeslot) =>
      nodes.set(timeslot, getTimeslotContent(timeslot, flags)),
    );
    return nodes;
  }

  showTimeslots() {
    const semester = this.selectedSemester();
    if (!semester) return false;
    return !_.isEmpty(semester.LecturePeriods) || !_.isEmpty(semester.TutorialPeriods);
  }

  render() {
    const semester = this.selectedSemester();
    const semesters = this.props.semesters.map((data) => data.Semester);

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

        {semester && (
          <div className="module-semester-info">
            <section className="module-exam">
              <h4>Exam</h4>
              <p>{formatExamDate(semester.ExamDate)}</p>

              <ModuleExamClash
                semester={semester.Semester}
                examDate={semester.ExamDate}
                moduleCode={this.props.moduleCode}
              />
            </section>

            {this.showTimeslots() && (
              <section className="module-timeslots">
                <h4>Timetable</h4>
                <TimeslotTable>{this.timeslotChildren()}</TimeslotTable>
              </section>
            )}
          </div>
        )}
      </div>
    );
  }
}
