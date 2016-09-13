import React, { Component, PropTypes } from 'react';
/* eslint-disable new-cap */
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import TimetableBackground from './TimetableBackground';
import TimetableDayRow from './TimetableDayRow';

const SCHOOLDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

class Timetable extends Component {
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
              <TimetableDayRow key={dayDisplayText}
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

Timetable.propTypes = {
  lessons: PropTypes.object,
  onModifyCell: PropTypes.func,
};

export default DragDropContext(HTML5Backend)(Timetable);
