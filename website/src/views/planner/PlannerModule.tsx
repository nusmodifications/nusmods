import { memo, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import classnames from 'classnames';

import { ModuleCode, ModuleCondensed, ModuleTitle, Semester } from 'types/modules';
import { Conflict, PlannerPlaceholder } from 'types/planner';
import config from 'config';
import { renderMCs } from 'utils/modules';
import { conflictToText } from 'utils/planner';
import { toSingaporeTime } from 'utils/timify';
import { AlertTriangle, ChevronDown } from 'react-feather';
import LinkModuleCodes from 'views/components/LinkModuleCodes';
import { modulePage } from 'views/routes/paths';

import ModuleMenu from './ModuleMenu';
import PlannerModuleSelect from './PlannerModuleSelect';
import styles from './PlannerModule.scss';

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
  type: string;

  // Actions
  removeModule: (id: string) => void;
  addCustomData: (moduleCode: ModuleCode) => void;
  setPlaceholderModule: (id: string, moduleCode: ModuleCode) => void;
}>;

/**
 * Component for a single module on the planner
 */
const PlannerModule = memo<Props>((props) => {
  const [isEditingPlaceholder, setEditingPlaceholder] = useState(false);

  const removeModule = () => props.removeModule(props.id);

  const editCustomData = () => {
    if (props.moduleCode) props.addCustomData(props.moduleCode);
  };

  const renderConflict = (conflict: Conflict) => {
    switch (conflict.type) {
      case 'noInfo':
        return (
          <div className={styles.conflictHeader}>
            <AlertTriangle className={styles.warningIcon} />
            <p>
              No data on this module.{' '}
              <button type="button" className="btn btn-link btn-inline" onClick={editCustomData}>
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
              Module may only be offered in{' '}
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
  };

  const renderMeta = () => {
    const { moduleCredit, examDate } = props;
    if (!moduleCredit && !examDate) return null;

    return (
      <div className={styles.moduleMeta}>
        {moduleCredit && <div>{renderMCs(moduleCredit)}</div>}
        {examDate && <div>{format(toSingaporeTime(examDate), 'MMM d, h:mm a')}</div>}
      </div>
    );
  };

  const renderPlaceholderForm = () => {
    const { placeholder, moduleCode, moduleTitle, semester } = props;

    if (!placeholder) return null;

    if (!isEditingPlaceholder) {
      return (
        <>
          <button
            type="button"
            className={classnames('btn btn-sm btn-svg', styles.placeholderSelect, {
              [styles.empty]: !moduleCode,
            })}
            onClick={() => setEditingPlaceholder(true)}
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
          onSelect={(module: ModuleCondensed | null) => {
            if (module) {
              props.setPlaceholderModule(props.id, module.moduleCode);
            }

            setEditingPlaceholder(false);
          }}
          onCancel={() => setEditingPlaceholder(false)}
          onBlur={() => setEditingPlaceholder(false)}
          showOnly={placeholder.modules}
          filter={placeholder.filter}
          defaultValue={moduleCode}
          className={styles.placeholderInput}
          semester={semester}
        />
      </form>
    );
  };

  const { id, placeholder, moduleCode, moduleTitle, index, conflict, type } = props;

  return (
    <Draggable key={moduleCode} draggableId={`${id}|${type}`} index={index}>
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
          <ModuleMenu removeModule={removeModule} editCustomData={editCustomData} />

          <div className={styles.moduleInfo}>
            <div className={styles.moduleName}>
              {placeholder ? (
                <>
                  <strong className={styles.placeholderName}>{placeholder.name}</strong>
                  {renderPlaceholderForm()}
                </>
              ) : (
                moduleCode && (
                  <Link className="d-block" to={modulePage(moduleCode, moduleTitle)}>
                    <strong>{moduleCode}</strong> {moduleTitle}
                  </Link>
                )
              )}
            </div>

            {renderMeta()}

            {conflict && <div className={styles.conflicts}>{renderConflict(conflict)}</div>}
          </div>
        </div>
      )}
    </Draggable>
  );
});

export default PlannerModule;
