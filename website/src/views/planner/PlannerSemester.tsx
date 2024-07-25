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
} from 'utils/planner';
import { useSelector } from 'react-redux';
import { getSemesterTimetableLessons } from 'selectors/timetables';
import { useHistory } from 'react-router-dom';
import { timetablePage } from 'views/routes/paths';
import PlannerModule from './PlannerModule';
import AddModule from './AddModule';
import styles from './PlannerSemester.scss';

type Props = Readonly<{
  year: string;
  semester: Semester;
  modules: PlannerModuleInfo[];

  showModuleMeta?: boolean;
  className?: string;

  addModule: (year: string, semester: Semester, module: AddModuleData) => void;
  removeModule: (id: string) => void;
  addCustomData: (moduleCode: ModuleCode) => void;
  setPlaceholderModule: (id: string, moduleCode: ModuleCode) => void;
  addModuleToTimetable: (semester: Semester, module: ModuleCode) => void;
}>;

function renderSemesterMeta(plannerModules: PlannerModuleInfo[]) {
  const moduleCredits = getTotalMC(plannerModules);

  return (
    <div className={styles.semesterMeta}>
      <p>
        {plannerModules.length} {plannerModules.length === 1 ? 'Course' : 'Courses'}
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
  setPlaceholderModule,
  addModuleToTimetable,
}) => {
  const timetable = useSelector(getSemesterTimetableLessons)(semester);

  const history = useHistory();
  const viewSemesterTimetable = () => {
    const timetablePath = timetablePage(semester);
    history.push(timetablePath);
  };

  const renderModule = (plannerModule: PlannerModuleInfo, index: number) => {
    const { id, moduleCode, moduleInfo, conflict, placeholder } = plannerModule;

    const showExamDate = showModuleMeta && config.academicYear === year;

    const isInTimetable = moduleCode !== undefined && moduleCode in timetable;

    return (
      <PlannerModule
        key={id}
        id={id}
        index={index}
        moduleCode={moduleCode}
        placeholder={placeholder}
        moduleTitle={getModuleTitle(plannerModule)}
        examDate={showExamDate && moduleInfo ? getExamDate(moduleInfo, semester) : null}
        moduleCredit={showModuleMeta ? getModuleCredit(plannerModule) : null}
        conflict={conflict}
        semester={semester}
        isInTimetable={isInTimetable}
        removeModule={removeModule}
        addCustomData={addCustomData}
        addModuleToTimetable={addModuleToTimetable}
        viewSemesterTimetable={viewSemesterTimetable}
        setPlaceholderModule={setPlaceholderModule}
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
              Drop course here to add to {getSemesterName(semester)}
            </p>
          )}

          {showModuleMeta && modules.length > 0 && renderSemesterMeta(modules)}

          <div className={styles.addModule}>
            <AddModule
              year={year}
              semester={semester}
              onAddModule={(module) => addModule(year, +semester, module)}
            />
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default React.memo(PlannerSemester);
