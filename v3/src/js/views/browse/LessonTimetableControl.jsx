// @flow
import React, { Component } from 'react';
import _ from 'lodash';

import type { Semester, SemesterData } from 'types/modules';

import ButtonGroupSelector from 'views/components/ButtonGroupSelector';
import LessonTimetable from './LessonTimetable';

type Props = {
  semestersOffered: Semester[],
  history: Array<SemesterData>,
};

type State = {
  selectedSem: ?string,
};

export default class LessonTimetableControl extends Component<Props, State> {
  props: Props;
  state: State;
  onSelectSem: Function;

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedSem: null,
    };
    this.onSelectSem = this.onSelectSem.bind(this);
  }

  onSelectSem(selectedSem: string): void {
    this.setState({ selectedSem });
  }

  render() {
    const {
      semestersOffered,
      history,
    } = this.props;
    const semesters = semestersOffered.map(s => `Semester ${s}`);

    const {
      selectedSem,
    } = this.state;

    const historyForSemester = history.find(h => `Semester ${h.Semester}` === selectedSem);

    let lessonsTimetable = null;
    if (historyForSemester) {
      const timetableByLessonType = _.groupBy(historyForSemester.Timetable, t => t.LessonType);
      if (_.isEmpty(timetableByLessonType)) {
        lessonsTimetable = <p>No timetable information available</p>;
      } else {
        lessonsTimetable = _.map(
          timetableByLessonType,
          (lessons, lessonType) =>
            <LessonTimetable key={lessonType} lessonType={lessonType} lessons={lessons} />);
      }
    } else {
      lessonsTimetable = <p>Select a semester to view timetable</p>;
    }

    return (
      <div>
        <ButtonGroupSelector
          choices={semesters}
          selectedChoice={selectedSem}
          onChoiceSelect={this.onSelectSem}
          ariaLabel="Select a semester"
        />
        {lessonsTimetable}
      </div>
    );
  }
}
