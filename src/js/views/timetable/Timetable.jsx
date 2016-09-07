import React, { PropTypes } from 'react';
// import { connect } from 'react-redux';

import TimetableRow from './TimetableRow';

const Timetable = () => {
  return (
    <div className="timetable-container">
      <div className="timetable">
        <div className="timetable-day">
          <div className="timetable-day-row">
            <div className="timetable-day-cell timetable-hour-cell"><span>Mon</span></div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
            <div className="timetable-hour-cell" style={{ flexGrow: 4 }}>
              <div className="test-cell"/>
            </div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell" style={{ flexGrow: 4 }}>
              <div className="test-cell"/>
            </div>
            <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
          </div>
          <div className="timetable-day-row">
            <div className="timetable-day-cell timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell timetable-hour-cell-alt"><span/></div>
            <div className="timetable-hour-cell timetable-hour-cell-alt"><span/></div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
            <div className="timetable-hour-cell" style={{ flexGrow: 4 }}>
              <div className="test-cell"/>
            </div>
            <div className="timetable-hour-cell" style={{ flexGrow: 4 }}>
              <div className="test-cell"/>
            </div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
            <div className="timetable-hour-cell"><span/></div>
            <div className="timetable-hour-cell timetable-cell-half-hour"><span/></div>
          </div>
        </div>
        <div className="timetable-day">
          <TimetableRow day="Tue"/>
        </div>
        <div className="timetable-day">
          <TimetableRow day="Wed"/>
        </div>
        <div className="timetable-day">
          <TimetableRow day="Thu"/>
        </div>
        <div className="timetable-day">
          <TimetableRow day="Fri"/>
        </div>
      </div>
      <div className="timetable timetable-bg">
        <div className="timetable-day">
          <TimetableRow altBackground/>
        </div>
      </div>
    </div>
  );
};

Timetable.propTypes = {
  lessons: PropTypes.array,
};

export default Timetable;
