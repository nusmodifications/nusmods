import React, { PropTypes } from 'react';
import classnames from 'classnames';
/* eslint-disable new-cap */
import { DragSource, DropTarget } from 'react-dnd';

import { LESSON_TYPE_ABBREV } from 'utils/timetable';
import prefixer from 'utils/prefixer';

const CELL = 'CELL';
const lessonSource = {
  beginDrag(props) {
    setTimeout(() => {
      // Begin dragging before showing alternative cells.
      props.onModifyCell(props.lesson);
    }, 0);
    return {};
  },
};

const lessonTarget = {
  drop(props) {
    props.onModifyCell(props.lesson);
  },
};

function dragCollect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

function dropCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
}

const TimetableCell = (props) => {
  const lesson = props.lesson;
  const widthStyle = props.width ? prefixer({ flexGrow: props.width }) : null;
  let cell = null;

  if (lesson) {
    const moduleCell = (
      <div className={classnames('timetable-module-cell animated', {
        'is-modifiable': lesson.isModifiable,
        'is-available': lesson.isAvailable,
        'pulse infinite': lesson.isActive,
        [`color-${lesson.colorIndex}`]: true,
        zoomIn: lesson.isAvailable,
      })}
        onClick={(event) => {
          event.stopPropagation();
          props.onModifyCell(lesson);
        }}
      >
        <div className="cell-module-code">{lesson.ModuleCode}</div>
        <div>
          <span className="cell-module-lesson-type">{LESSON_TYPE_ABBREV[lesson.LessonType]}</span>
          <span className="cell-module-class">{' '}[{lesson.ClassNo}]</span>
        </div>
        <div><span className="cell-module-venue">{lesson.Venue}</span></div>
      </div>
    );

    if (lesson.isModifiable || lesson.isAvailable) {
      // Lesson can be modified and dragged around.
      // TODO: Separate out dnd targets and sources depending on modifiable/available.
      cell = props.connectDropTarget(props.connectDragSource(moduleCell));
    } else {
      // Non-modifiable lesson.
      cell = moduleCell;
    }
  }

  return (
    <div className="timetable-cell" style={widthStyle}>{cell}</div>
  );
};

TimetableCell.propTypes = {
  lesson: PropTypes.object,
  width: PropTypes.number,
  onModifyCell: PropTypes.func,
  connectDragSource: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
};

export default DragSource(CELL, lessonSource, dragCollect)(
  DropTarget(CELL, lessonTarget, dropCollect)(TimetableCell)
);
