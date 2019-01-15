// @flow

import type { ModuleCode, ModuleTitle, TreeFragment } from 'types/modules';
import React, { PureComponent } from 'react';
import Downshift from 'downshift';
import { Draggable } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

import classnames from 'classnames';
import { examDateToDate, renderMCs } from 'utils/modules';
import { conflictToText } from 'utils/planner';
import { AlertTriangle, ChevronDown } from 'views/components/icons';
import LinkModuleCodes from 'views/components/LinkModuleCodes';
import { modulePage } from 'views/routes/paths';
import styles from './PlannerModule.scss';

type Props = {|
  // Module information
  +moduleCode: ModuleCode,
  +moduleTitle: ?ModuleTitle,
  +moduleCredit: ?number,
  +examDate: ?string,
  +conflicts: ?Array<TreeFragment>,

  // For draggable
  +index: number,

  // Actions
  +removeModule: (ModuleCode) => void,
|};

const ModuleMenu = React.memo((props: {| +removeModule: () => void |}) => {
  const menuItems = [['Remove', props.removeModule]];

  return (
    <Downshift
      onChange={(item) => {
        menuItems.forEach(([menuItem, onSelect]) => {
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
          <div className={classnames('dropdown-menu', { show: isOpen })} {...getMenuProps()}>
            {menuItems.map(([item], itemIndex) => (
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
  );
});

/**
 * Component for a single module on the planner
 */
export default class PlannerModule extends PureComponent<Props> {
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
    const { conflicts } = this.props;
    if (!conflicts) return null;

    return (
      <div className={styles.conflicts}>
        <div className={styles.conflictHeader}>
          <AlertTriangle className={styles.warningIcon} />
          <p>These modules may need to be taken first</p>
        </div>

        <ul className={styles.prereqs}>
          {conflicts.map((conflict, i) => (
            <li key={i}>
              <LinkModuleCodes>{conflictToText(conflict)}</LinkModuleCodes>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  removeModule = () => this.props.removeModule(this.props.moduleCode);

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
            <ModuleMenu removeModule={this.removeModule} />

            <div className={styles.moduleInfo}>
              <div className={styles.moduleName}>
                <Link to={modulePage(moduleCode, moduleTitle)}>
                  <strong>{moduleCode}</strong> {moduleTitle}
                </Link>
              </div>

              {this.renderMeta()}

              {this.renderConflict()}
            </div>
          </div>
        )}
      </Draggable>
    );
  }
}
