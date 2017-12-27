// @flow
import type { Node } from 'react';

import React, { PureComponent, Fragment } from 'react';

import type { Semester, SemesterData } from 'types/modules';

import Timetable from 'views/timetable/Timetable';
import SemesterPicker from 'views/components/module-info/SemesterPicker';
import { arrangeLessonsForWeek } from 'utils/timetables';
import { colorLessonsByKey } from 'utils/colors';
import { getFirstAvailableSemester } from 'utils/modules';
import styles from './LessonTimetable.scss';

type Props = {
  history: SemesterData[],
};

type State = {
  selectedSem: Semester,
};

export default class LessonTimetableControl extends PureComponent<Props, State> {
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
    const semester = this.props.history.find((data) => data.Semester === this.state.selectedSem);
    if (!semester || !semester.Timetable) {
      return <p>Timetable info not available</p>;
    }

    const lessons = semester.Timetable.map((lesson) => ({
      ...lesson,
      ModuleCode: '',
      ModuleTitle: '',
    }));
    const coloredLessons = colorLessonsByKey(lessons, 'LessonType');
    const arrangedLessons = arrangeLessonsForWeek(coloredLessons);

    return <Timetable lessons={arrangedLessons} />;
  }

  render() {
    const semesters = this.props.history.map((data) => data.Semester);

    return (
      <Fragment>
        {history.length > 1 && (
          <SemesterPicker
            semesters={semesters}
            selectedSemester={this.state.selectedSem}
            onSelectSemester={this.onSelectSemester}
          />
        )}

        <div className={styles.lessonTimetable}>{this.renderTimetable()}</div>
      </Fragment>
    );
  }
}
