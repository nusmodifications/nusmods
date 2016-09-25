// @flow
import React from 'react';
import classnames from 'classnames';
/* eslint-disable new-cap */
import { DragSource, DropTarget } from 'react-dnd';

import { LESSON_TYPE_ABBREV } from 'utils/timetable';
import type { DraggableLesson } from 'types/modules';

type Props = {
  lesson: DraggableLesson,
  width: number,
  onModifyCell: Function,
  connectDragSource: Function,
  connectDropTarget: Function,
};

const CELL = 'CELL';
const lessonSource = {
  beginDrag(props: Props) {
    setTimeout(() => {
      // Begin dragging before showing alternative cells.
      props.onModifyCell(props.lesson);
    }, 0);
    return {};
  },
};

const lessonTarget = {
  drop(props: Props) {
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

function TimetableCell(props: Props) {
  const lesson = props.lesson;
  // Postcss-js adds a freaking 2mb to the script payload; it's not worth
  // adding it just to save the following few lines of code.
  const widthStyle = props.width ? {
    flexGrow: props.width,
    WebkitBoxFlex: props.width,
    msFlexPositive: props.width,
  } : null;
  let cell = null;

  if (lesson) {
    const moduleCell = (
      <div className={classnames('timetable-module-cell', {
        'is-modifiable': lesson.isModifiable,
        'is-available': lesson.isAvailable,
        'is-active': lesson.isActive,
        [`color-${lesson.colorIndex}`]: true,
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

  return <div className="timetable-cell" style={widthStyle}>{cell}</div>;
}

export default DragSource(CELL, lessonSource, dragCollect)(
  DropTarget(CELL, lessonTarget, dropCollect)(TimetableCell)
);
