import { FC, memo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import type { SemesterData } from 'types/modules';
import type { ColoredLesson, InteractableLesson, TimetableArrangement } from 'types/timetables';

import Timetable from 'views/timetable/Timetable';
import SemesterPicker from 'views/components/module-info/SemesterPicker';
import { arrangeLessonsForWeek } from 'utils/timetables';
import { colorLessonsByKey } from 'utils/colors';
import { getFirstAvailableSemester } from 'utils/modules';
import { venuePage } from 'views/routes/paths';
import styles from './LessonTimetable.scss';

const SemesterLessonTimetable: FC<{ semesterData?: SemesterData }> = ({ semesterData }) => {
  const history = useHistory();

  if (!semesterData?.timetable) {
    return <p>Timetable info not available</p>;
  }

  const lessons = semesterData.timetable.map((lesson) => ({
    ...lesson,
    moduleCode: '',
    title: '',
    canBeSelectedAsActiveLesson: !!lesson.venue,
  }));
  const coloredLessons: ColoredLesson[] = colorLessonsByKey(lessons, 'lessonType');
  const arrangedLessons: TimetableArrangement<ColoredLesson> =
    arrangeLessonsForWeek(coloredLessons);

  return (
    <Timetable
      lessons={arrangedLessons}
      onModifyCell={(lesson: InteractableLesson) => history.push(venuePage(lesson.venue))}
    />
  );
};

const LessonTimetable: FC<{ allSemesterData: readonly SemesterData[] }> = ({ allSemesterData }) => {
  const [selectedSem, setSelectedSem] = useState(() => getFirstAvailableSemester(allSemesterData));
  return (
    <>
      <SemesterPicker
        semesters={allSemesterData.map((data) => data.semester)}
        selectedSemester={selectedSem}
        onSelectSemester={setSelectedSem}
      />
      <div className={styles.lessonTimetable}>
        <SemesterLessonTimetable
          semesterData={allSemesterData.find((data) => data.semester === selectedSem)}
        />
      </div>
    </>
  );
};

export default memo(LessonTimetable);
