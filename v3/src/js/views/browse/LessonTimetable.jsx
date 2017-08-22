// @flow
import React from 'react';

import type { LessonType, RawLesson } from 'types/modules';

import Table from 'views/components/Table';

type Props = {
  lessonType: LessonType,
  lessons: RawLesson[],
};

const headers = [
  'Class No',
  'Week Type',
  'Day',
  'Start Time',
  'End Time',
  'Venue',
];

export default function LessonTimetable(props: Props) {
  const data = props.lessons.map(lesson =>
    [
      lesson.ClassNo,
      lesson.WeekText,
      lesson.DayText,
      lesson.StartTime,
      lesson.EndTime,
      lesson.Venue,
    ],
  );

  return (
    <Table
      title={props.lessonType}
      data={data}
      headers={headers}
      noDataText="No timetable information"
    />
  );
}
