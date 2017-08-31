// @flow
import type { Node } from 'react';

import React, { Component } from 'react';
import _ from 'lodash';

import type { SemesterData } from 'types/modules';

import config from 'config';
import { getFirstAvailableSemester, formatExamDate } from 'utils/modules';
import ButtonGroupSelector from 'views/components/ButtonGroupSelector';
import TimeslotTable from './TimeslotTable';

type Props = {
  semesters: SemesterData[],
};

type State = {
  selected: string,
};

const semesterNames = config.shortSemesterNames;

export default class ModuleSemesterInfo extends Component<Props, State> {
  props: Props;

  state: State;

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

  timeslotChildren(): Map<string, Node> {
    const semester = this.selectedSemester() || {};
    const {
      LecturePeriods: lectures = [],
      TutorialPeriods: tutorials = [],
    } = semester;

    const children = new Map();
    const addChild = (timeslot, component) => {
      let child = children.get(timeslot);
      if (!child) {
        child = [];
        children.set(timeslot, child);
      }

      // This type check makes Flow happy
      if (typeof child.push === 'function') child.push(component);
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
            <TimeslotTable>{ this.timeslotChildren() }</TimeslotTable>
          </section>}
        </div>}
      </div>
    );
  }
}
