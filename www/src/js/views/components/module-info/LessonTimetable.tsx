import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { Lesson, Semester, SemesterData } from 'types/modules';

import Timetable from 'views/timetable/Timetable';
import SemesterPicker from 'views/components/module-info/SemesterPicker';
import { arrangeLessonsForWeek } from 'utils/timetables';
import { colorLessonsByKey } from 'utils/colors';
import { getFirstAvailableSemester } from 'utils/modules';
import { venuePage } from 'views/routes/paths';
import styles from './LessonTimetable.scss';

type Props = RouteComponentProps & { semesterData: ReadonlyArray<SemesterData> };

type State = {
  selectedSem: Semester;
};

export class LessonTimetableComponent extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedSem: getFirstAvailableSemester(props.semesterData),
    };
  }

  onSelectSemester = (selectedSem: Semester) => {
    this.setState({ selectedSem });
  };

  renderTimetable(): React.ReactNode {
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
      <>
        <SemesterPicker
          semesters={semesters}
          selectedSemester={this.state.selectedSem}
          onSelectSemester={this.onSelectSemester}
        />
        <div className={styles.lessonTimetable}>{this.renderTimetable()}</div>
      </>
    );
  }
}

export default withRouter(LessonTimetableComponent);
