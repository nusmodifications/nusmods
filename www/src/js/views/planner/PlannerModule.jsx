// @flow

import type { Module, ModuleCode } from 'types/modules';
import React, { PureComponent } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { renderMCs } from 'utils/modules';
import styles from './PlannerModule.scss';

type Props = {
  moduleCode: ModuleCode,
  module: ?Module,
  index: number,
};

export default class PlannerModule extends PureComponent<Props> {
  render() {
    const { moduleCode, module, index } = this.props;

    return (
      <Draggable key={moduleCode} draggableId={moduleCode} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            className={styles.module}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div>
              {moduleCode} {module?.ModuleTitle}
            </div>
            {module && <div>{renderMCs(module.ModuleCredit)}</div>}
          </div>
        )}
      </Draggable>
    );
  }
}
