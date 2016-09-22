// @flow

import React, { Component } from 'react';
/* eslint-disable new-cap */
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import type { TimetableArrangement } from 'types/timetables';

import TimetableBackground from './TimetableBackground';
import TimetableDay from './TimetableDay';

const SCHOOLDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Props = {
  lessons: TimetableArrangement,
  onModifyCell: Function,
};

class Timetable extends Component {
  props: Props;

  render() {
    return (
      <div className="timetable-container">
        <div className="timetable">
          {SCHOOLDAYS.map((day) => {
            const dayDisplayText = day.substring(0, 3);
            if (day === 'Saturday' && !this.props.lessons.Saturday) {
              return null;
            }
            return (
              <TimetableDay key={dayDisplayText}
                onModifyCell={this.props.onModifyCell}
                day={dayDisplayText}
                dayLessonRows={this.props.lessons[day]}
              />
            );
          })}
        </div>
        <TimetableBackground/>
      </div>
    );
  }
}


export default DragDropContext(HTML5Backend)(Timetable);
