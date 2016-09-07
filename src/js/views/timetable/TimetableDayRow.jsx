import React, { PropTypes } from 'react';

import TimetableRow from './TimetableRow';

const TimetableDayRow = (props) => {
  return (
    <div className="timetable-day">
      {props.dayLessonRows ?
        props.dayLessonRows.map((dayLessonRow, i) => {
          return (
            <TimetableRow day={props.day} key={i} lessons={dayLessonRow}/>
          );
        }) : <TimetableRow day={props.day}/>
      }
      {/* <div className="timetable-day-row">
        <div className="timetable-day-cell timetable-hour-cell"><span>Mon</span></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell" style={{ flexGrow: 4 }}>
          <div className="test-cell"/>
        </div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell" style={{ flexGrow: 4 }}>
          <div className="test-cell"/>
        </div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
      </div>
      <div className="timetable-day-row">
        <div className="timetable-day-cell timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell" style={{ flexGrow: 4 }}>
          <div className="test-cell"/>
        </div>
        <div className="timetable-hour-cell" style={{ flexGrow: 4 }}>
          <div className="test-cell"/>
        </div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
        <div className="timetable-hour-cell"><span/></div>
      </div> */}
    </div>
  );
};

TimetableDayRow.propTypes = {
  day: PropTypes.string,
  dayLessonRows: PropTypes.array,
};

export default TimetableDayRow;
