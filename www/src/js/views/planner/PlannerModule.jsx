// @flow

import type { ModuleCode, ModuleTitle, TreeFragment } from 'types/modules';
import React, { PureComponent } from 'react';
import Downshift from 'downshift';
import { Draggable } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

import classnames from 'classnames';
import { renderMCs } from 'utils/modules';
import { conflictToText } from 'utils/planner';
import { AlertTriangle, ChevronDown } from 'views/components/icons';
import Tooltip from 'views/components/Tooltip';
import LinkModuleCodes from 'views/components/LinkModuleCodes';
import { modulePage } from 'views/routes/paths';
import styles from './PlannerModule.scss';

type Props = {|
  +moduleCode: ModuleCode,
  +moduleTitle: ?ModuleTitle,
  +moduleCredit: ?number,
  +examDate: ?string,

  +index: number,

  +conflicts: ?Array<TreeFragment>,

  +removeModule: () => void,
|};

export default class PlannerModule extends PureComponent<Props> {
  menuItems = [['Remove', this.props.removeModule]];

  render() {
    const { moduleCode, moduleTitle, moduleCredit, examDate, index, conflicts } = this.props;

    return (
      <Draggable key={moduleCode} draggableId={moduleCode} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            className={classnames(styles.module, {
              [styles.warning]: conflicts,
              [styles.isDragging]: snapshot.isDragging,
            })}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div className={styles.moduleInfo}>
              <div className={styles.moduleName}>
                <Link to={modulePage(moduleCode, moduleTitle)}>
                  <strong>{moduleCode}</strong> {moduleTitle}
                </Link>
              </div>
              {(moduleCredit || examDate) && (
                <div className={styles.moduleMeta}>
                  {moduleCredit && <div>{renderMCs(moduleCredit)}</div>}
                  {examDate && <div>{format(new Date(examDate), 'MMM d, h:mm a')}</div>}
                </div>
              )}
            </div>

            <div className={styles.actions}>
              <Downshift
                onChange={(item) => {
                  this.menuItems.forEach(([menuItem, onSelect]) => {
                    if (item === menuItem) {
                      onSelect();
                    }
                  });
                }}
              >
                {({ getItemProps, getMenuProps, highlightedIndex, isOpen, toggleMenu }) => (
                  <div className={styles.menuBtn}>
                    <button
                      className={classnames('btn close')}
                      type="button"
                      onClick={toggleMenu}
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded={isOpen}
                    >
                      <ChevronDown />
                    </button>
                    <div
                      className={classnames('dropdown-menu', { show: isOpen })}
                      {...getMenuProps()}
                    >
                      {this.menuItems.map(([item], itemIndex) => (
                        <button
                          key={item}
                          className={classnames('dropdown-item', {
                            'dropdown-selected': highlightedIndex === itemIndex,
                          })}
                          {...getItemProps({ item })}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Downshift>

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
                  <AlertTriangle className={styles.warningIcon} />
                </Tooltip>
              )}
            </div>
          </div>
        )}
      </Draggable>
    );
  }
}
