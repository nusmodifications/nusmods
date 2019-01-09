// @flow

import type { ModuleCode, ModuleTitle, TreeFragment } from 'types/modules';
import React, { PureComponent } from 'react';
import Downshift, { type ChildrenFunction } from 'downshift';
import { Draggable } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

import classnames from 'classnames';
import { examDateToDate, renderMCs } from 'utils/modules';
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
  onMenuSelect = (item: string) => {
    this.menuItems.forEach(([menuItem, onSelect]) => {
      if (item === menuItem) {
        onSelect();
      }
    });
  };

  menuItems = [['Remove', this.props.removeModule]];

  renderMeta() {
    const { moduleCredit, examDate } = this.props;
    if (!moduleCredit && !examDate) return null;

    return (
      <div className={styles.moduleMeta}>
        {moduleCredit && <div>{renderMCs(moduleCredit)}</div>}
        {examDate && <div>{format(examDateToDate(examDate), 'MMM d, h:mm a')}</div>}
      </div>
    );
  }

  renderConflict() {
    const { conflicts, moduleCode } = this.props;
    if (!conflicts) return null;

    return (
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
    );
  }

  renderMenu: ChildrenFunction<string> = ({
    getItemProps,
    getMenuProps,
    highlightedIndex,
    isOpen,
    toggleMenu,
  }) => (
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
      <div className={classnames('dropdown-menu', { show: isOpen })} {...getMenuProps()}>
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
  );

  render() {
    const { moduleCode, moduleTitle, index, conflicts } = this.props;

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

              {this.renderMeta()}
            </div>

            <div className={styles.actions}>
              <Downshift onChange={this.onMenuSelect}>{this.renderMenu}</Downshift>

              {this.renderConflict()}
            </div>
          </div>
        )}
      </Draggable>
    );
  }
}
