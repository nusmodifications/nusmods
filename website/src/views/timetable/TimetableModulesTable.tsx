import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { isEmpty, sortBy } from 'lodash';
import { produce } from 'immer';

import { Book, BookOpen, Eye, EyeOff, Trash } from 'react-feather';
import { ModuleWithColor, ModuleWithTaLessonTypes, TombstoneModule } from 'types/views';
import { ColorIndex } from 'types/timetables';
import { LessonType, ModuleCode, Semester } from 'types/modules';
import { State as StoreState } from 'types/state';
import { ModuleTableOrder } from 'types/reducers';

import ColorPicker from 'views/components/ColorPicker';
import {
  selectModuleColor,
  hideLessonInTimetable,
  showLessonInTimetable,
  addTaLessonInTimetable,
  removeTaLessonInTimetable,
} from 'actions/timetables';
import { getExamDate, getFormattedExamDate, renderMCs } from 'utils/modules';
import { intersperse } from 'utils/array';
import { BULLET_NBSP } from 'utils/react';
import { modulePage } from 'views/routes/paths';
import elements from 'views/elements';
import Tooltip from 'views/components/Tooltip';
import config from 'config';

import Downshift from 'downshift';
import styles from './TimetableModulesTable.scss';
import ModuleTombstone from './ModuleTombstone';
import { moduleOrders } from './ModulesTableFooter';

export type Props = {
  semester: Semester;
  readOnly: boolean;
  horizontalOrientation: boolean;
  moduleTableOrder: ModuleTableOrder;
  modules: ModuleWithTaLessonTypes[];
  tombstone: TombstoneModule | null; // Placeholder for a deleted module

  // Actions
  selectModuleColor: (semester: Semester, moduleCode: ModuleCode, colorIndex: ColorIndex) => void;
  hideLessonInTimetable: (semester: Semester, moduleCode: ModuleCode) => void;
  showLessonInTimetable: (semester: Semester, moduleCode: ModuleCode) => void;
  addTaLessonInTimetable: (
    semester: Semester,
    moduleCode: ModuleCode,
    lessonType: LessonType,
  ) => void;
  removeTaLessonInTimetable: (
    semester: Semester,
    moduleCode: ModuleCode,
    lessonType: LessonType,
  ) => void;
  onRemoveModule: (moduleCode: ModuleCode) => void;
  resetTombstone: () => void;
};

type TaButtonOption = {
  lessonType: LessonType;
  isTa: boolean;
};

export const TimetableModulesTableComponent: React.FC<Props> = (props) => {
  const renderModuleActions = (module: ModuleWithTaLessonTypes) => {
    const removeBtnLabel = `Remove ${module.moduleCode} from timetable`;
    const hideBtnLabel = `${module.isHiddenInTimetable ? 'Show' : 'Hide'} ${module.moduleCode}`;
    const taBtnLabel = `Configure TA mode for ${module.moduleCode}`;
    const { semester } = props;

    const taBtnOptions: TaButtonOption[] = Object.entries(module.taInTimetable).map(
      ([lessonType, isTa]) => ({
        lessonType,
        isTa,
      }),
    );

    const toggleTaLesson = (lessonType: LessonType, isTa: boolean) =>
      isTa
        ? props.removeTaLessonInTimetable(semester, module.moduleCode, lessonType)
        : props.addTaLessonInTimetable(semester, module.moduleCode, lessonType);

    const isTaBtnDisabled = isEmpty(module.taInTimetable);

    return (
      <div className={styles.moduleActionButtons}>
        <div className="btn-group">
          <Tooltip content={removeBtnLabel} touch={['hold', 50]}>
            <button
              type="button"
              className={classnames('btn btn-outline-secondary btn-svg', styles.moduleAction)}
              aria-label={removeBtnLabel}
              onClick={() => props.onRemoveModule(module.moduleCode)}
            >
              <Trash className={styles.actionIcon} />
            </button>
          </Tooltip>
          <Tooltip content={hideBtnLabel} touch={['hold', 50]}>
            <button
              type="button"
              className={classnames('btn btn-outline-secondary btn-svg', styles.moduleAction)}
              aria-label={hideBtnLabel}
              onClick={() => {
                if (module.isHiddenInTimetable) {
                  props.showLessonInTimetable(semester, module.moduleCode);
                } else {
                  props.hideLessonInTimetable(semester, module.moduleCode);
                }
              }}
            >
              {module.isHiddenInTimetable ? (
                <Eye className={styles.actionIcon} />
              ) : (
                <EyeOff className={styles.actionIcon} />
              )}
            </button>
          </Tooltip>
          <Downshift
            onSelect={(item) => {
              taBtnOptions.forEach(({ lessonType, isTa }) => {
                if (item === lessonType) {
                  toggleTaLesson(lessonType, isTa);
                }
              });
            }}
          >
            {({
              getRootProps,
              getItemProps,
              getMenuProps,
              highlightedIndex,
              isOpen,
              toggleMenu,
            }) => (
              <>
                <div
                  className={classnames('dropdown-menu', { show: isOpen }, styles.taModuleMenu)}
                  {...getMenuProps({})}
                >
                  {taBtnOptions.map(({ lessonType, isTa }, itemIndex) => (
                    <button
                      type="button"
                      key={itemIndex}
                      className={classnames('dropdown-item', {
                        'dropdown-selected': highlightedIndex === itemIndex,
                      })}
                      onClick={(e) => e.stopPropagation()}
                      {...getItemProps({ item: lessonType })}
                    >
                      {isTa ? 'Unset' : 'Set'} TA for {lessonType}
                    </button>
                  ))}
                </div>
                <Tooltip
                  {...getRootProps({ refKey: 'innerRef' }, { suppressRefError: true })}
                  content={taBtnLabel}
                  touch={['hold', 50]}
                >
                  <button
                    type="button"
                    className={classnames('btn btn-outline-secondary btn-svg', styles.moduleAction)}
                    aria-label={taBtnLabel}
                    onClick={() => toggleMenu()}
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    disabled={isTaBtnDisabled}
                  >
                    {module.isTaInTimetable ? (
                      <BookOpen className={styles.actionIcon} />
                    ) : (
                      <Book className={styles.actionIcon} />
                    )}
                  </button>
                </Tooltip>
              </>
            )}
          </Downshift>
        </div>
      </div>
    );
  };

  const renderModule = (module: ModuleWithTaLessonTypes) => {
    const { semester, readOnly, tombstone, resetTombstone } = props;

    if (tombstone && tombstone.moduleCode === module.moduleCode) {
      return <ModuleTombstone module={module} resetTombstone={resetTombstone} />;
    }

    // Second row of text consists of the exam date and the MCs
    const secondRowText = [renderMCs(module.moduleCredit)];
    if (config.examAvailabilitySet.has(semester)) {
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
            label={`Change ${module.moduleCode} timetable color`}
            color={module.colorIndex}
            isHidden={module.isHiddenInTimetable}
            isTa={module.isTaInTimetable}
            onChooseColor={(colorIndex: ColorIndex) => {
              props.selectModuleColor(semester, module.moduleCode, colorIndex);
            }}
          />
        </div>
        <div className={styles.moduleInfo}>
          {!readOnly && renderModuleActions(module)}
          <Link to={modulePage(module.moduleCode, module.title)}>
            {module.moduleCode} {module.title}
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
  );
};

export default connect(
  (state: StoreState) => ({ moduleTableOrder: state.settings.moduleTableOrder }),
  {
    selectModuleColor,
    hideLessonInTimetable,
    showLessonInTimetable,
    addTaLessonInTimetable,
    removeTaLessonInTimetable,
  },
)(React.memo(TimetableModulesTableComponent));
