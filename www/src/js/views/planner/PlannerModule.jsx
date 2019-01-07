// @flow

import type { Module, ModuleCode, TreeFragment } from 'types/modules';
import React, { PureComponent } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import classnames from 'classnames';

import { renderMCs } from 'utils/modules';
import { conflictToText } from 'utils/planner';
import { AlertTriangle } from 'views/components/icons';
import Tooltip from 'views/components/Tooltip';
import LinkModuleCodes from 'views/components/LinkModuleCodes';
import styles from './PlannerModule.scss';

type Props = {|
  +moduleCode: ModuleCode,
  +index: number,

  +module: ?Module,
  +conflicts: ?Array<TreeFragment>,

  +removeModule: () => void,
|};

export default class PlannerModule extends PureComponent<Props> {
  render() {
    const { moduleCode, module, index, conflicts } = this.props;

    return (
      <Draggable key={moduleCode} draggableId={moduleCode} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            className={classnames(styles.module, {
              [styles.warning]: conflicts,
            })}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div className={styles.moduleInfo}>
              <div className={styles.moduleName}>
                <strong>{moduleCode}</strong> {module?.ModuleTitle}
              </div>
              {module && <div>{renderMCs(module.ModuleCredit)}</div>}
            </div>
            {conflicts && (
              <Tooltip
                content={
                  <div className={styles.prereqs}>
                    <p>{moduleCode} requires these modules to be taken</p>
                    <ul>
                      {conflicts.map((conflict, i) => (
                        <li key={i}>
                          <LinkModuleCodes>{conflictToText(conflict)}</LinkModuleCodes>
                        </li>
                      ))}
                    </ul>
                  </div>
                }
                interactive
              >
                <AlertTriangle className={styles.warning} />
              </Tooltip>
            )}
          </div>
        )}
      </Draggable>
    );
  }
}
