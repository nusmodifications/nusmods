// @flow

import type { DayText, LessonTime, RawLesson } from 'types/modules';
import type { TimetableArrangement } from 'types/timetables';

import React, { Component } from 'react';
import _ from 'lodash';
import classnames from 'classnames';
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
const MINIMUM_CELL_WIDTH: number = 70;

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
  horizontalOrientation: boolean,
  onModifyCell: Function,
};

class Timetable extends Component {
  props: Props;

  render() {
    const { startingIndex, endingIndex } = calculateBorderTimings(this.props.lessons);
    // Each cell is half an hour.
    const numberOfCells: number = (endingIndex - startingIndex);
    const value: number = 100 / numberOfCells;
    const orientationStyleProp: string = this.props.horizontalOrientation ? 'width' : 'height';
    let numRows: number = 0;
    if (!this.props.horizontalOrientation) {
      SCHOOLDAYS.forEach((day) => {
        const numRowIfEmpty = day !== 'Saturday' ? 1 : 0; // We don't show Saturday by default.
        numRows += this.props.lessons[day] ? this.props.lessons[day].length : numRowIfEmpty;
      });
    }
    const timetableContentContainerDOM = document.querySelector('.timetable-content-container');
    let minWidth = 0;
    if (timetableContentContainerDOM) {
      const contentWidth = parseInt(window.getComputedStyle(timetableContentContainerDOM).width, 10);
      const idealContentWidth = numRows * MINIMUM_CELL_WIDTH;
      if (idealContentWidth > contentWidth) {
        minWidth = idealContentWidth;
      }
    }

    return (
      <div className={classnames('timetable-container', {
        'horizontal-mode': this.props.horizontalOrientation,
        'vertical-mode': !this.props.horizontalOrientation,
      })}>
        <div className="timetable-inner-container">
          <style>{`
            .timetable-cell { ${orientationStyleProp}: ${value}%; }
            .timetable-content-inner-container { min-width: ${minWidth}px; }
          `}</style>
          <TimetableTimings startingIndex={startingIndex}
            endingIndex={endingIndex}
          />
          <div className="timetable-content-container">
            <div className="timetable-content-inner-container">
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
                      cellSize={value}
                      horizontalOrientation={this.props.horizontalOrientation}
                      cellOrientationStyleProp={orientationStyleProp}
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
      </div>
    );
  }
}


export default DragDropContext(HTML5Backend)(Timetable);
