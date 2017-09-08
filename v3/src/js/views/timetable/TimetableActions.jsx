// @flow
import React from 'react';
import classnames from 'classnames';

type Props = {
  isVerticalOrientation: boolean,
  toggleTimetableOrientation: Function,
  downloadAsJpeg: Function,
  downloadAsIcal: Function,
};

function TimetableActions(props: Props) {
  const { isVerticalOrientation } = props;
  return (
    <div className="timetable-action-row text-xs-right">
      <button
        type="button"
        className="btn btn-outline-primary"
        title={isVerticalOrientation ? 'Vertical Mode' : 'Horizontal mode'}
        aria-label={isVerticalOrientation ? 'Vertical Mode' : 'Horizontal mode'}
        onClick={props.toggleTimetableOrientation}
      >
        <i
          className={classnames('fa', 'fa-exchange', {
            'fa-rotate-90': isVerticalOrientation,
          })}
          aria-hidden="true"
        />
      </button>
      <button
        type="button"
        title="Download as Image"
        aria-label="Download as Image"
        className="btn btn-outline-primary"
        onClick={props.downloadAsJpeg}
      >
        <i className="fa fa-image" aria-hidden="true" />
      </button>
      <button
        type="button"
        title="Download as iCal"
        aria-label="Download as iCal"
        className="btn btn-outline-primary"
        onClick={props.downloadAsIcal}
      >
        <i className="fa fa-calendar" aria-hidden="true" />
      </button>
    </div>
  );
}

export default TimetableActions;
