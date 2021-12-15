import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { sortBy } from 'lodash';
import produce from 'immer';

import { ModuleWithColor, TombstoneModule } from 'types/views';
import { ColorIndex, Lesson } from 'types/timetables';
import { Module, ModuleCode, Semester } from 'types/modules';
import { State as StoreState } from 'types/state';
import { ModuleTableOrder } from 'types/reducers';

import ColorPicker from 'views/components/ColorPicker';
import { Edit, Eye, EyeOff, Trash } from 'react-feather';
import {
  hideLessonInTimetable,
  selectModuleColor,
  showLessonInTimetable,
} from 'actions/timetables';
import { getExamDate, getFormattedExamDate, renderMCs } from 'utils/modules';
import { intersperse } from 'utils/array';
import { BULLET_NBSP } from 'utils/react';
import { modulePage } from 'views/routes/paths';
import elements from 'views/elements';
import Tooltip from 'views/components/Tooltip';
import config from 'config';

import Modal from 'views/components/Modal';
import { removeCustomIdentifier } from 'utils/custom';
import styles from './TimetableModulesTable.scss';
import ModuleTombstone from './ModuleTombstone';
import { moduleOrders } from './ModulesTableFooter';
import CustomModuleEdit from './CustomModuleEdit';

export type Props = {
  semester: Semester;
  readOnly: boolean;
  horizontalOrientation: boolean;
  moduleTableOrder: ModuleTableOrder;
  modules: ModuleWithColor[];
  customLessons: Lesson[];
  tombstone: TombstoneModule | null; // Placeholder for a deleted module

  // Actions
  addModule: (semester: Semester, moduleCode: ModuleCode) => void;
  selectModuleColor: (semester: Semester, moduleCode: ModuleCode, colorIndex: ColorIndex) => void;
  hideLessonInTimetable: (semester: Semester, moduleCode: ModuleCode) => void;
  showLessonInTimetable: (semester: Semester, moduleCode: ModuleCode) => void;
  onRemoveModule: (moduleCode: ModuleCode) => void;
  onRemoveCustomModule: (moduleCode: ModuleCode) => void;
  editCustomModule: (oldModuleCode: ModuleCode, newModuleCode: ModuleCode, lesson: Lesson) => void;
  resetTombstone: () => void;
};

export const TimetableModulesTableComponent: React.FC<Props> = (props) => {
  const renderModuleActions = (module: ModuleWithColor) => {
    const actualModuleCode = module.isCustom
      ? removeCustomIdentifier(module.moduleCode)
      : module.moduleCode;

    const hideBtnLabel = `${module.hiddenInTimetable ? 'Show' : 'Hide'} ${actualModuleCode}`;
    const removeBtnLabel = `Remove ${actualModuleCode} from timetable`;
    const { semester } = props;

    const removeModule = (moduleCode: ModuleCode, isCustom: boolean | undefined) => {
      if (isCustom) {
        props.onRemoveCustomModule(moduleCode);
      } else {
        props.onRemoveModule(moduleCode);
      }
    };

    const customLesson = (module: ModuleWithColor) =>
      props.customLessons.find((lesson) => lesson.moduleCode === module.moduleCode);

    return (
      <div className={styles.moduleActionButtons}>
        <div className="btn-group">
          {module.isCustom && (
            <CustomModuleEdit
              lesson={customLesson(module)}
              editCustomModule={props.editCustomModule}
              moduleActionStyle={styles.moduleAction}
              actionIconStyle={styles.actionIcon}
            />
          )}
          <Tooltip content={removeBtnLabel} touch="hold">
            <button
              type="button"
              className={classnames('btn btn-outline-secondary btn-svg', styles.moduleAction)}
              aria-label={removeBtnLabel}
              onClick={() => removeModule(module.moduleCode, module.isCustom)}
            >
              <Trash className={styles.actionIcon} />
            </button>
          </Tooltip>
          <Tooltip content={hideBtnLabel} touch="hold">
            <button
              type="button"
              className={classnames('btn btn-outline-secondary btn-svg', styles.moduleAction)}
              aria-label={hideBtnLabel}
              onClick={() => {
                if (module.hiddenInTimetable) {
                  props.showLessonInTimetable(semester, module.moduleCode);
                } else {
                  props.hideLessonInTimetable(semester, module.moduleCode);
                }
              }}
            >
              {module.hiddenInTimetable ? (
                <Eye className={styles.actionIcon} />
              ) : (
                <EyeOff className={styles.actionIcon} />
              )}
            </button>
          </Tooltip>
        </div>
      </div>
    );
  };

  const renderModule = (module: ModuleWithColor) => {
    const { semester, readOnly, tombstone, resetTombstone } = props;
    const actualModuleCode = module.isCustom
      ? removeCustomIdentifier(module.moduleCode)
      : module.moduleCode;

    if (tombstone && tombstone.moduleCode === module.moduleCode) {
      return <ModuleTombstone module={module} resetTombstone={resetTombstone} />;
    }

    // Second row of text consists of the exam date and the MCs
    const secondRowText = [renderMCs(module.moduleCredit)];
    if (module.isCustom) {
      secondRowText[0] = 'Custom Module';
    } else if (config.examAvailabilitySet.has(semester)) {
      secondRowText.unshift(
        getExamDate(module, semester)
          ? `Exam: ${getFormattedExamDate(module, semester)}`
          : 'No Exam',
      );
    }

    return (
      <>
        <div className={styles.moduleColor}>
          <ColorPicker
            label={`Change ${actualModuleCode} timetable color`}
            color={module.colorIndex}
            isHidden={module.hiddenInTimetable}
            onChooseColor={(colorIndex: ColorIndex) => {
              props.selectModuleColor(semester, module.moduleCode, colorIndex);
            }}
          />
        </div>
        <div className={styles.moduleInfo}>
          {!readOnly && renderModuleActions(module)}
          <Link to={module.isCustom ? '#' : modulePage(module.moduleCode, module.title)}>
            {actualModuleCode} {module.title}
          </Link>
          <div className={styles.moduleExam}>{intersperse(secondRowText, BULLET_NBSP)}</div>
        </div>
      </>
    );
  };

  const { semester, tombstone, horizontalOrientation, moduleTableOrder } = props;
  let { modules } = props;

  // tombstone contains the data for the last deleted module. We insert it back
  // so that it gets sorted into its original location, then in renderModule()
  // takes care of rendering the tombstone
  if (tombstone && !modules.some((module) => module.moduleCode === tombstone.moduleCode)) {
    modules = produce(modules, (draft: ModuleWithColor[]) => {
      draft.splice(tombstone.index, 0, tombstone);
    });
  }
  modules = sortBy(modules, (module) => moduleOrders[moduleTableOrder].orderBy(module, semester));

  return (
    <>
      <div className={classnames(styles.modulesTable, elements.moduleTable, 'row')}>
        {modules.map((module) => (
          <div
            className={classnames(
              styles.modulesTableRow,
              'col-sm-6',
              horizontalOrientation ? 'col-lg-4' : 'col-md-12',
            )}
            key={module.moduleCode}
          >
            {renderModule(module)}
          </div>
        ))}
      </div>
    </>
  );
};

export default connect(
  (state: StoreState) => ({ moduleTableOrder: state.settings.moduleTableOrder }),
  {
    selectModuleColor,
    hideLessonInTimetable,
    showLessonInTimetable,
  },
)(React.memo(TimetableModulesTableComponent));
