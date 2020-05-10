import * as React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import classnames from 'classnames';

import { Semester, ModuleCode } from 'types/modules';
import { PlannerModuleInfo } from 'types/views';
import config from 'config';
import { getExamDate, renderMCs } from 'utils/modules';
import {
  getDroppableId,
  getModuleCredit,
  getModuleTitle,
  getSemesterName,
  getTotalMC,
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

  addModule: (moduleCode: ModuleCode, year: string, semester: Semester) => void;
  removeModule: (moduleCode: ModuleCode) => void;
  addCustomData: (moduleCode: ModuleCode) => void;
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
  addModule,
  removeModule,
  addCustomData,
}) => {
  const renderModule = (plannerModule: PlannerModuleInfo, index: number) => {
    const { moduleCode, moduleInfo, conflict } = plannerModule;

    const showExamDate = showModuleMeta && config.academicYear === year;

    return (
      <PlannerModule
        key={moduleCode}
        index={index}
        moduleCode={moduleCode}
        moduleTitle={getModuleTitle(plannerModule)}
        examDate={showExamDate && moduleInfo ? getExamDate(moduleInfo, semester) : null}
        moduleCredit={showModuleMeta ? getModuleCredit(plannerModule) : null}
        conflict={conflict}
        removeModule={removeModule}
        addCustomData={addCustomData}
      />
    );
  };

  const droppableId = getDroppableId(year, semester);

  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          className={classnames(styles.semester, className, {
            [styles.emptyList]: modules.length === 0,
            [styles.dragOver]: snapshot.isDraggingOver,
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

          <div className={styles.addModule}>
            <AddModule
              year={year}
              semester={semester}
              onAddModule={(moduleCode) => addModule(moduleCode, year, +semester)}
            />
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default React.memo(PlannerSemester);
