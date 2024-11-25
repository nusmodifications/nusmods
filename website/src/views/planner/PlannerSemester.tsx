import * as React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import AddCalendarIcon from 'img/icons/add-calendar.svg';
import classnames from 'classnames';

import { Semester, ModuleCode } from 'types/modules';
import { AddModuleData, PlannerModuleInfo } from 'types/planner';
import { Dispatch } from 'types/redux';
import config from 'config';
import { getExamDate, renderMCs } from 'utils/modules';
import {
  getDroppableId,
  getModuleCredit,
  getModuleTitle,
  getSemesterName,
  getTotalMC,
} from 'utils/planner';
import { useSelector, useDispatch } from 'react-redux';
import { getSemesterTimetableLessons } from 'selectors/timetables';
import { useHistory } from 'react-router-dom';
import { timetablePage } from 'views/routes/paths';
import { openNotification } from 'actions/app';
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

  const dispatch = useDispatch<Dispatch>();

  const renderModule = (plannerModule: PlannerModuleInfo, index: number) => {
    const { id, moduleCode, moduleInfo, conflict, placeholder } = plannerModule;

    const showExamDate = showModuleMeta && config.academicYear === year;

    const isModuleInTimetable = moduleCode !== undefined && moduleCode in timetable;

    const displayedConflict =
      year === config.academicYear || (conflict && ['prereq', 'duplicate'].includes(conflict.type))
        ? conflict
        : null;

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
        conflict={displayedConflict}
        semester={semester}
        isInTimetable={isModuleInTimetable}
        removeModule={removeModule}
        addCustomData={addCustomData}
        addModuleToTimetable={addModuleToTimetable}
        viewSemesterTimetable={viewSemesterTimetable}
        setPlaceholderModule={setPlaceholderModule}
      />
    );
  };

  const isSemesterInTimetable = modules.every(
    (module) => module.moduleCode === undefined || module.moduleCode in timetable,
  );

  const addSemesterToTimetable = () => {
    modules.forEach((module) => {
      if (module.moduleCode !== undefined) {
        addModuleToTimetable(semester, module.moduleCode);
      }
    });
    dispatch(openNotification(`Added to Semester ${semester} timetable.`));
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

          {showModuleMeta &&
            year === config.academicYear &&
            modules.length > 0 &&
            !isSemesterInTimetable && (
              <div className={styles.addSemesterToTimetable}>
                <button
                  type="button"
                  className="btn btn-sm btn-link"
                  onClick={addSemesterToTimetable}
                >
                  <AddCalendarIcon />
                  Add Semester to Timetable
                </button>
              </div>
            )}
        </div>
      )}
    </Droppable>
  );
};

export default React.memo(PlannerSemester);
