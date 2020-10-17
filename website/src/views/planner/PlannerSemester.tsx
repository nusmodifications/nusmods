import * as React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import classnames from 'classnames';

import { Semester, ModuleCode } from 'types/modules';
import { AddModuleData, PlannerModuleInfo } from 'types/planner';
import config from 'config';
import { getExamDate, renderMCs } from 'utils/modules';
import {
  getDroppableId,
  getModuleCredit,
  getModuleTitle,
  getSemesterName,
  getTotalMC,
  isYearLong,
  SEMESTER_LONG,
  YEAR_LONG,
  YEAR_LONG_SEMESTER,
  PLAN_TO_TAKE_SEMESTER,
  EXEMPTION_SEMESTER,
} from 'utils/planner';
import PlannerModule from './PlannerModule';
import AddModule from './AddModule';
import styles from './PlannerSemester.scss';

type Props = Readonly<{
  year: string;
  semester: Semester;
  modules: PlannerModuleInfo[];

  showModuleMeta?: boolean;
  className?: string;
  draggedModuleType: string | null;

  addModule: (year: string, semester: Semester, module: AddModuleData) => void;
  removeModule: (id: string) => void;
  addCustomData: (moduleCode: ModuleCode) => void;
  setPlaceholderModule: (id: string, moduleCode: ModuleCode) => void;
}>;

function renderSemesterMeta(plannerModules: PlannerModuleInfo[]) {
  const moduleCredits = getTotalMC(plannerModules);

  return (
    <div className={styles.semesterMeta}>
      <p>
        {plannerModules.length} {plannerModules.length === 1 ? 'module' : 'modules'}
      </p>
      <p>{renderMCs(moduleCredits)}</p>
    </div>
  );
}

/**
 * Component for a single column of modules for a single semester
 */
const PlannerSemester: React.FC<Props> = ({
  year,
  semester,
  modules,
  showModuleMeta = true,
  className,
  draggedModuleType,
  addModule,
  removeModule,
  addCustomData,
  setPlaceholderModule,
}) => {
  const renderModule = (plannerModule: PlannerModuleInfo, index: number) => {
    const { id, moduleCode, moduleInfo, conflict, placeholder } = plannerModule;

    const showExamDate = showModuleMeta && config.academicYear === year;

    return (
      <PlannerModule
        key={id}
        id={id}
        type={isYearLong(plannerModule) ? YEAR_LONG : SEMESTER_LONG}
        index={index}
        moduleCode={moduleCode}
        placeholder={placeholder}
        moduleTitle={getModuleTitle(plannerModule)}
        examDate={showExamDate && moduleInfo ? getExamDate(moduleInfo, semester) : null}
        moduleCredit={showModuleMeta ? getModuleCredit(plannerModule) : null}
        conflict={conflict}
        semester={semester}
        removeModule={removeModule}
        addCustomData={addCustomData}
        setPlaceholderModule={setPlaceholderModule}
      />
    );
  };

  const droppableId = getDroppableId(year, semester);
  let droppableType = SEMESTER_LONG;
  if (semester === YEAR_LONG_SEMESTER) {
    droppableType = YEAR_LONG;
  } else if (semester === PLAN_TO_TAKE_SEMESTER || semester === EXEMPTION_SEMESTER) {
    droppableType = 'DEFAULT';
  }
  return (
    <Droppable
      droppableId={droppableId}
      isDropDisabled={droppableType !== 'DEFAULT' && draggedModuleType !== droppableType}
    >
      {(provided, snapshot) => (
        <div
          className={classnames(styles.semester, className, {
            [styles.emptyList]: modules.length === 0,
            [styles.dragOver]: snapshot.isDraggingOver,
            [styles.yearLong]: semester === 0,
          })}
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {modules.map(renderModule)}

          {provided.placeholder}

          {modules.length === 0 && (
            <p className={styles.emptyListMessage}>
              Drop module here to add to {getSemesterName(semester)}
            </p>
          )}

          {showModuleMeta && modules.length > 0 && renderSemesterMeta(modules)}

          {+semester !== YEAR_LONG_SEMESTER && (
            <div className={styles.addModule}>
              <AddModule
                year={year}
                semester={semester}
                onAddModule={(module) => addModule(year, +semester, module)}
              />
            </div>
          )}
        </div>
      )}
    </Droppable>
  );
};

export default React.memo(PlannerSemester);
