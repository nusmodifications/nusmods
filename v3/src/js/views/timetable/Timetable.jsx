// @flow

import type { DayText, LessonTime, RawLesson } from 'types/modules';
import type { TimetableArrangement } from 'types/timetables';

import React, { Component } from 'react';
import _ from 'lodash';
/* eslint-disable new-cap */
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import { convertTimeToIndex } from 'utils/timify';

import TimetableBackground from './TimetableBackground';
import TimetableTimings from './TimetableTimings';
import TimetableDay from './TimetableDay';

const SCHOOLDAYS: Array<DayText> = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DEFAULT_EARLIEST_TIME: LessonTime = '0800';
const DEFAULT_LATEST_TIME: LessonTime = '1800';

function calculateBorderTimings(lessons: TimetableArrangement): { startingIndex: number, endingIndex: number } {
  let earliestTime: number = convertTimeToIndex(DEFAULT_EARLIEST_TIME);
  let latestTime: number = convertTimeToIndex(DEFAULT_LATEST_TIME);
  SCHOOLDAYS.forEach((day) => {
    const lessonsArray: Array<RawLesson> = _.flatten(lessons[day]);
    lessonsArray.forEach((lesson) => {
      earliestTime = Math.min(earliestTime, convertTimeToIndex(lesson.StartTime));
      latestTime = Math.max(latestTime, convertTimeToIndex(lesson.EndTime));
    });
  });
  return {
    startingIndex: earliestTime,
    endingIndex: latestTime,
  };
}

type Props = {
  lessons: TimetableArrangement,
  onModifyCell: Function,
};

class Timetable extends Component {
  props: Props;

  render() {
    const { startingIndex, endingIndex } = calculateBorderTimings(this.props.lessons);
    // Each cell is half an hour.
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
