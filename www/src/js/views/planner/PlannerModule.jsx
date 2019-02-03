// @flow

import React, { PureComponent } from 'react';
import Downshift from 'downshift';
import { Draggable } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import classnames from 'classnames';

import type { ModuleCode, ModuleTitle } from 'types/modules';
import type { Conflict } from 'types/views';
import config from 'config';
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
  +conflict: ?Conflict,

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

function renderConflict(conflict: Conflict) {
  switch (conflict.type) {
    case 'noInfo':
      return (
        <div className={styles.conflictHeader}>
          <AlertTriangle className={styles.warningIcon} />
          <p>No data on this module</p>
        </div>
      );

    case 'semester':
      return (
        <div className={styles.conflictHeader}>
          <AlertTriangle className={styles.warningIcon} />
          <p>
            Module may only only be offered in{' '}
            {conflict.semestersOffered
              .map((semester) => config.shortSemesterNames[semester])
              .join(', ')}
          </p>
        </div>
      );

    case 'exam':
      return (
        <div className={styles.conflictHeader}>
          <AlertTriangle className={styles.warningIcon} />
          <p>{conflict.conflictModules.join(', ')} have clashing exams</p>
        </div>
      );

    case 'prereq':
      return (
        <>
          <div className={styles.conflictHeader}>
            <AlertTriangle className={styles.warningIcon} />
            <p>These modules may need to be taken first</p>
          </div>

          <ul className={styles.prereqs}>
            {conflict.unfulfilledPrereqs.map((prereq, i) => (
              <li key={i}>
                <LinkModuleCodes>{conflictToText(prereq)}</LinkModuleCodes>
              </li>
            ))}
          </ul>
        </>
      );

    default:
      return null;
  }
}

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

  removeModule = () => this.props.removeModule(this.props.moduleCode);

  render() {
    const { moduleCode, moduleTitle, index, conflict } = this.props;

    return (
      <Draggable key={moduleCode} draggableId={moduleCode} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            className={classnames(styles.module, {
              [styles.warning]: conflict,
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

              {conflict && <div className={styles.conflicts}>{renderConflict(conflict)}</div>}
            </div>
          </div>
        )}
      </Draggable>
    );
  }
}
