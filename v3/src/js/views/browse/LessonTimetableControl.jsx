// @flow
import React, { Component } from 'react';
import _ from 'lodash';

import { SemesterData } from 'types/modules';
import ButtonGroupSelector from 'views/components/ButtonGroupSelector';
import LessonTimetable from './LessonTimetable';

type Props = {
  semestersOffered: num[],
  history: Array<SemesterData>,
};

export default class LessonTimetableControl extends Component {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedSem: null,
    };
    this.onSelectSem = this.onSelectSem.bind(this);
  }

  onSelectSem(selectedSem) {
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

    const historyBySem = _.groupBy(history, h => `Semester ${h.Semester}`);


    let lessonsTimetable = null;
    if (selectedSem) {
      const timetable = historyBySem[selectedSem][0].Timetable;
      const timetableByLessonType = _.groupBy(timetable, t => t.LessonType);
      lessonsTimetable = _.map(
        timetableByLessonType,
        (lessons, lessonType) =>
          <LessonTimetable key={lessonType} lessonType={lessonType} lessons={lessons} />);
    } else {
      lessonsTimetable = null;
    }

    return (
      <div>
        <ButtonGroupSelector choices={semesters}
          selectedChoice={selectedSem}
          onChoiceSelect={this.onSelectSem}
        />
        {lessonsTimetable}
      </div>
    );
  }
}
