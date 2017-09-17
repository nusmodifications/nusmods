// @flow
import type { Node } from 'react';

import React, { PureComponent } from 'react';
import { noop } from 'lodash';

import type { Semester, SemesterData } from 'types/modules';

import Timetable from 'views/timetable/Timetable';
import SemesterPicker from 'views/components/module-info/SemesterPicker';
import { arrangeLessonsForWeek, colorLessonsByType } from 'utils/timetables';
import { getFirstAvailableSemester } from 'utils/modules';
import styles from './LessonTimetable.scss';

type Props = {
  history: SemesterData[],
};

type State = {
  selectedSem: Semester,
};

export default class LessonTimetableControl extends PureComponent<Props, State> {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedSem: getFirstAvailableSemester(props.history),
    };
  }

  onSelectSemester = (selectedSem: ?Semester) => {
    if (selectedSem) {
      this.setState({ selectedSem });
    }
  };

  renderTimetable(): Node {
    const semester = this.props.history.find(data => data.Semester === this.state.selectedSem);
    if (!semester || !semester.Timetable) {
      return <p>Timetable info not available</p>;
    }

    const lessons = semester.Timetable.map(lesson => ({
      ...lesson, ModuleCode: '', ModuleTitle: '',
    }));
    const coloredLessons = colorLessonsByType(lessons);
    const arrangedLessons = arrangeLessonsForWeek(coloredLessons);

    return (
      <Timetable
        lessons={arrangedLessons}
        isVerticalOrientation={false}
        onModifyCell={noop}
      />
    );
  }

  render() {
    const { history } = this.props;
    const { selectedSem } = this.state;

    return (
      <div>
        {history.length > 1 &&
          <SemesterPicker
            semesters={history}
            selectedSemester={selectedSem}
            onSelectSemester={this.onSelectSemester}
          />}

        <div className={styles.lessonTimetable}>
          {this.renderTimetable()}
        </div>
      </div>
    );
  }
}
