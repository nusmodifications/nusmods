// @flow

import type { RawLesson } from 'types/modules';
import type { TimetableArrangement } from 'types/timetables';

import React, { Component } from 'react';
import _ from 'lodash';
import classnames from 'classnames';
/* eslint-disable new-cap */
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import {
  SCHOOLDAYS,
  calculateBorderTimings,
} from 'utils/timify';

import TimetableBackground from './TimetableBackground';
import TimetableTimings from './TimetableTimings';
import TimetableDay from './TimetableDay';

const MINIMUM_CELL_WIDTH: number = 70;
const MINIMUM_CELL_HEIGHT: number = 1.25; // rem
const MINIMUM_TIMETABLE_HEIGHT: number = 45; // rem

type Props = {
  lessons: TimetableArrangement,
  horizontalOrientation: boolean,
  onModifyCell: Function,
};

class Timetable extends Component {
  props: Props;

  render() {
    const lessons: Array<RawLesson> = [];
    SCHOOLDAYS.forEach((day) => {
      const lessonsArray: Array<RawLesson> = _.flatten(this.props.lessons[day]);
      lessons.push(...lessonsArray);
    });
    const { startingIndex, endingIndex } = calculateBorderTimings(lessons);
    // Each cell is half an hour.
    const numberOfCells: number = (endingIndex - startingIndex);
    const timetableHeight: number = Math.max(numberOfCells * MINIMUM_CELL_HEIGHT, MINIMUM_TIMETABLE_HEIGHT);
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
        <style>{`
          .vertical-mode .timetable-inner-container { height: ${timetableHeight}rem; }
          .timetable-cell { ${orientationStyleProp}: ${value}%; }
          .timetable-content-inner-container { min-width: ${minWidth}px; }
        `}</style>
        <div className="timetable-inner-container">
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
