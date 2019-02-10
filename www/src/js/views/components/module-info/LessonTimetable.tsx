// @flow
import type { Node } from 'react';

import React, { PureComponent, Fragment } from 'react';
import { withRouter, type ContextRouter } from 'react-router-dom';

import type { Lesson, Semester, SemesterData } from 'types/modules';

import Timetable from 'views/timetable/Timetable';
import SemesterPicker from 'views/components/module-info/SemesterPicker';
import { arrangeLessonsForWeek } from 'utils/timetables';
import { colorLessonsByKey } from 'utils/colors';
import { getFirstAvailableSemester } from 'utils/modules';
import { venuePage } from 'views/routes/paths';
import styles from './LessonTimetable.scss';

type Props = {
  ...ContextRouter,
  semesterData: SemesterData[],
};

type State = {
  selectedSem: Semester,
};

export class LessonTimetableComponent extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedSem: getFirstAvailableSemester(props.semesterData),
    };
  }

  onSelectSemester = (selectedSem: ?Semester) => {
    if (selectedSem) {
      this.setState({ selectedSem });
    }
  };

  renderTimetable(): Node {
    const semester = this.props.semesterData.find(
      (data) => data.Semester === this.state.selectedSem,
    );
    if (!semester || !semester.Timetable) {
      return <p>Timetable info not available</p>;
    }

    const lessons = semester.Timetable.map((lesson) => ({
      ...lesson,
      ModuleCode: '',
      ModuleTitle: '',
      isModifiable: true,
    }));
    const coloredLessons = colorLessonsByKey(lessons, 'LessonType');
    const arrangedLessons = arrangeLessonsForWeek(coloredLessons);

    return (
      <Timetable
        lessons={arrangedLessons}
        onModifyCell={(lesson: Lesson) => {
          this.props.history.push(venuePage(lesson.Venue));
        }}
      />
    );
  }

  render() {
    const semesters = this.props.semesterData.map((data) => data.Semester);

    return (
      <Fragment>
        <SemesterPicker
          semesters={semesters}
          selectedSemester={this.state.selectedSem}
          onSelectSemester={this.onSelectSemester}
        />
        <div className={styles.lessonTimetable}>{this.renderTimetable()}</div>
      </Fragment>
    );
  }
}

export default withRouter(LessonTimetableComponent);
