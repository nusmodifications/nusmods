// @flow

import type { DayText, LessonTime, RawLesson } from 'types/modules';
import type { TimetableArrangement } from 'types/timetables';

import React, { Component } from 'react';
import _ from 'lodash';
/* eslint-disable new-cap */
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import { convertTimeToIndex, convertIndexToTime } from 'utils/timify';

import TimetableBackground from './TimetableBackground';
import TimetableTimings from './TimetableTimings';
import TimetableDay from './TimetableDay';

const SCHOOLDAYS: Array<DayText> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DEFAULT_EARLIEST_TIME: LessonTime = '0900';
const DEFAULT_LATEST_TIME: LessonTime = '2000';

function extremeLessonTimings(lessonsArray: Array<RawLesson>): { earliestTime: LessonTime, latestTime: LessonTime } {
  const lessonsTimingsIndexArray = lessonsArray.map((lesson: RawLesson) => {
    return {
      startTimeIndex: convertTimeToIndex(lesson.StartTime),
      endTimeIndex: convertTimeToIndex(lesson.EndTime),
    };
  });
  const earliestTimeIndex: number = Math.min(...lessonsTimingsIndexArray.map(lesson => lesson.startTimeIndex));
  const latestTimeIndex: number = Math.max(...lessonsTimingsIndexArray.map(lesson => lesson.endTimeIndex));

  return {
    earliestTime: convertIndexToTime(earliestTimeIndex),
    latestTime: convertIndexToTime(latestTimeIndex),
  };
}

type Props = {
  lessons: TimetableArrangement,
  onModifyCell: Function,
};

class Timetable extends Component {
  props: Props;

  calculateBorderTimings(lessons: TimetableArrangement): { earliestTime: LessonTime, latestTime: LessonTime } {
    let lessonsArray: Array<RawLesson> = [];
    SCHOOLDAYS.forEach((day) => {
      lessonsArray = lessonsArray.concat(_.flatten(lessons[day]));
    });
    if (_.isEmpty(lessonsArray)) {
      return {
        earliestTime: DEFAULT_EARLIEST_TIME,
        latestTime: DEFAULT_LATEST_TIME,
      };
    }
    const { earliestTime, latestTime } = extremeLessonTimings(lessonsArray);
    return {
      earliestTime: DEFAULT_EARLIEST_TIME < earliestTime ? DEFAULT_EARLIEST_TIME : earliestTime,
      latestTime: DEFAULT_LATEST_TIME < latestTime ? latestTime : DEFAULT_LATEST_TIME,
    };
  }

  render() {
    const { earliestTime, latestTime } = this.calculateBorderTimings(this.props.lessons);
    // Each cell is half an hour.
    const startingIndex = convertTimeToIndex(earliestTime);
    const endingIndex = convertTimeToIndex(latestTime);
    const numberOfCells = (endingIndex - startingIndex);
    const width = 100 / numberOfCells;
    return (
      <div className="timetable-container horizontal-mode">
        <style>
          {`.timetable-cell { width: ${width}% }`}
        </style>
        <TimetableTimings startingIndex={startingIndex}
          endingIndex={endingIndex}
        />
        <div className="">
          <div className="timetable-inner-container">
            <div className="timetable">
              {SCHOOLDAYS.map((day) => {
                const dayDisplayText = day.substring(0, 3);
                if (day === 'Saturday' && !this.props.lessons.Saturday) {
                  return null;
                }
                return (
                  <TimetableDay key={dayDisplayText}
                    startingIndex={startingIndex}
                    endingIndex={endingIndex}
                    cellWidth={width}
                    onModifyCell={this.props.onModifyCell}
                    day={dayDisplayText}
                    dayLessonRows={this.props.lessons[day]}
                  />
                );
              })}
            </div>
            <TimetableBackground numberOfCells={numberOfCells}/>
          </div>
        </div>
      </div>
    );
  }
}


export default DragDropContext(HTML5Backend)(Timetable);
