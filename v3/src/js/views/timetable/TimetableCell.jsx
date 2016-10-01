// @flow
import React from 'react';
import classnames from 'classnames';
/* eslint-disable new-cap */
import { DragSource, DropTarget } from 'react-dnd';

import { LESSON_TYPE_ABBREV } from 'utils/timetables';
import type { DraggableLesson } from 'types/modules';

type Props = {
  lesson: DraggableLesson,
  size: number,
  styleProp: string,
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
  let cell = null;
  const style = {};
  if (props.size) {
    style[props.styleProp] = `${props.size}%`;
  }

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

  return <span className="timetable-cell" style={style}>{cell}</span>;
}

export default DragSource(CELL, lessonSource, dragCollect)(
  DropTarget(CELL, lessonTarget, dropCollect)(TimetableCell)
);
