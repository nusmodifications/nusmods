import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import classnames from 'classnames';

import { ModuleCode, ModuleTitle, Semester } from 'types/modules';
import { Conflict, PlannerPlaceholder } from 'types/planner';
import config from 'config';
import { renderMCs } from 'utils/modules';
import { conflictToText } from 'utils/planner';
import { toSingaporeTime } from 'utils/timify';
import { AlertTriangle, ChevronDown } from 'views/components/icons';
import LinkModuleCodes from 'views/components/LinkModuleCodes';
import { modulePage } from 'views/routes/paths';

import ModuleMenu from './ModuleMenu';
import styles from './PlannerModule.scss';
import PlannerModuleSelect from './PlannerModuleSelect';

type Props = Readonly<{
  // Module information
  moduleTitle: ModuleTitle | null;
  moduleCredit: number | null;
  examDate: string | null;
  moduleCode?: ModuleCode;
  placeholder?: PlannerPlaceholder;
  conflict?: Conflict | null;
  semester?: Semester;

  // For draggable
  id: string;
  index: number;

  // Actions
  removeModule: (id: string) => void;
  addCustomData: (moduleCode: ModuleCode) => void;
  setPlaceholderModule: (id: string, moduleCode: ModuleCode) => void;
}>;

type State = {
  isEditingPlaceholder: boolean;
};

/**
 * Component for a single module on the planner
 */
export default class PlannerModule extends React.PureComponent<Props, State> {
  state: State = {
    isEditingPlaceholder: false,
  };

  removeModule = () => {
    this.props.removeModule(this.props.id);
  };

  editCustomData = () => {
    if (this.props.moduleCode) {
      this.props.addCustomData(this.props.moduleCode);
    }
  };

  toggleEditPlaceholder = () => {
    this.setState((state) => ({
      isEditingPlaceholder: !state.isEditingPlaceholder,
    }));
  };

  setPlaceholderModule = (moduleCode: ModuleCode) => {
    this.props.setPlaceholderModule(this.props.id, moduleCode);
    this.toggleEditPlaceholder();
  };

  renderConflict(conflict: Conflict) {
    switch (conflict.type) {
      case 'noInfo':
        return (
          <div className={styles.conflictHeader}>
            <AlertTriangle className={styles.warningIcon} />
            <p>
              No data on this module.{' '}
              <button
                type="button"
                className="btn btn-link btn-inline"
                onClick={this.editCustomData}
              >
                Add data
              </button>
            </p>
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

  renderMeta() {
    const { moduleCredit, examDate } = this.props;
    if (!moduleCredit && !examDate) return null;

    return (
      <div className={styles.moduleMeta}>
        {moduleCredit && <div>{renderMCs(moduleCredit)}</div>}
        {examDate && <div>{format(toSingaporeTime(examDate), 'MMM d, h:mm a')}</div>}
      </div>
    );
  }

  renderPlaceholderForm() {
    const { placeholder, moduleCode, moduleTitle, semester } = this.props;
    if (!placeholder) return null;

    if (!this.state.isEditingPlaceholder) {
      return (
        <>
          <button
            type="button"
            className={classnames('btn btn-sm btn-svg', styles.placeholderSelect, {
              [styles.empty]: !moduleCode,
            })}
            onClick={this.toggleEditPlaceholder}
          >
            {moduleCode || 'Select Module'} <ChevronDown />
          </button>{' '}
          {moduleCode && moduleTitle && (
            <Link to={modulePage(moduleCode, moduleTitle)}>{moduleTitle}</Link>
          )}
        </>
      );
    }

    return (
      <form>
        <PlannerModuleSelect
          onSelect={this.setPlaceholderModule}
          onCancel={this.toggleEditPlaceholder}
          onBlur={this.toggleEditPlaceholder}
          showOnly={placeholder.modules}
          filter={placeholder.filter}
          defaultValue={moduleCode}
          className={styles.placeholderInput}
          semester={semester}
        />
      </form>
    );
  }

  render() {
    const { id, placeholder, moduleCode, moduleTitle, index, conflict } = this.props;

    return (
      <Draggable key={moduleCode} draggableId={id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            className={classnames(styles.module, {
              [styles.warning]: conflict,
              [styles.isDragging]: snapshot.isDragging,
              [styles.placeholder]: placeholder && !moduleCode,
            })}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <ModuleMenu removeModule={this.removeModule} editCustomData={this.editCustomData} />

            <div className={styles.moduleInfo}>
              <div className={styles.moduleName}>
                {placeholder ? (
                  <>
                    <strong className={styles.placeholderName}>{placeholder.name}</strong>
                    {this.renderPlaceholderForm()}
                  </>
                ) : (
                  moduleCode && (
                    <Link className="d-block" to={modulePage(moduleCode, moduleTitle)}>
                      <strong>{moduleCode}</strong> {moduleTitle}
                    </Link>
                  )
                )}
              </div>

              {this.renderMeta()}

              {conflict && <div className={styles.conflicts}>{this.renderConflict(conflict)}</div>}
            </div>
          </div>
        )}
      </Draggable>
    );
  }
}
