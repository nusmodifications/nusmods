import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { sortBy } from 'lodash';

import { ModuleCode, ModuleWithColor, Semester } from 'types/modules';
import { ColorIndex } from 'types/reducers';
import { ModuleTableOrder } from 'types/views';

import ColorPicker from 'views/components/ColorPicker';
import { Eye, EyeOff, Trash } from 'views/components/icons/index';
import {
  hideLessonInTimetable,
  selectModuleColor,
  showLessonInTimetable,
} from 'actions/timetables';
import { getFormattedModuleExamDate, getModuleExamDate, renderMCs } from 'utils/modules';
import { modulePage } from 'views/routes/paths';
import elements from 'views/elements';
import Tooltip from 'views/components/Tooltip';

import styles from './TimetableModulesTable.scss';
import ModuleTombstone from './ModuleTombstone';
import { moduleOrders } from './ModulesTableFooter';

type Props = {
  semester: Semester;
  readOnly: boolean;
  horizontalOrientation: boolean;
  moduleTableOrder: ModuleTableOrder;
  modules: ModuleWithColor[];
  tombstone: ModuleWithColor | null | undefined; // Placeholder for a deleted module

  // Actions
  selectModuleColor: Function;
  hideLessonInTimetable: (semester: Semester, moduleCode: ModuleCode) => void;
  showLessonInTimetable: (semester: Semester, moduleCode: ModuleCode) => void;
  onRemoveModule: (moduleWithColor: ModuleWithColor) => void;
  resetTombstone: () => void;
};

class TimetableModulesTable extends React.PureComponent<Props> {
  renderModuleActions(module) {
    const hideBtnLabel = `${module.hiddenInTimetable ? 'Show' : 'Hide'} ${module.ModuleCode}`;
    const removeBtnLabel = `Remove ${module.ModuleCode} from timetable`;
    const { semester } = this.props;

    return (
      <div className={styles.moduleActionButtons}>
        <div className="btn-group">
          <Tooltip content={removeBtnLabel} touchHold>
            <button
              type="button"
              className={classnames('btn btn-outline-secondary btn-svg', styles.moduleAction)}
              aria-label={removeBtnLabel}
              onClick={() => this.props.onRemoveModule(module)}
            >
              <Trash className={styles.actionIcon} />
            </button>
          </Tooltip>
          <Tooltip content={hideBtnLabel} touchHold>
            <button
              type="button"
              className={classnames('btn btn-outline-secondary btn-svg', styles.moduleAction)}
              aria-label={hideBtnLabel}
              onClick={() => {
                if (module.hiddenInTimetable) {
                  this.props.showLessonInTimetable(semester, module.ModuleCode);
                } else {
                  this.props.hideLessonInTimetable(semester, module.ModuleCode);
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
  }

  renderModule = (module) => {
    const { semester, readOnly, tombstone, resetTombstone } = this.props;

    if (tombstone && tombstone.ModuleCode === module.ModuleCode) {
      return <ModuleTombstone module={module} resetTombstone={resetTombstone} />;
    }

    return (
      <>
        <div className={styles.moduleColor}>
          <ColorPicker
            label={`Change ${module.ModuleCode} timetable color`}
            color={module.colorIndex}
            isHidden={module.hiddenInTimetable}
            onChooseColor={(colorIndex: ColorIndex) => {
              this.props.selectModuleColor(semester, module.ModuleCode, colorIndex);
            }}
          />
        </div>
        <div className={styles.moduleInfo}>
          {!readOnly && this.renderModuleActions(module)}
          <Link to={modulePage(module.ModuleCode, module.ModuleTitle)}>
            {module.ModuleCode} {module.ModuleTitle}
          </Link>
          <div className={styles.moduleExam}>
            {getModuleExamDate(module, semester)
              ? `Exam: ${getFormattedModuleExamDate(module, semester)}`
              : 'No Exam'}
            &nbsp;&middot;&nbsp;
            {renderMCs(module.ModuleCredit)}
          </div>
        </div>
      </>
    );
  };

  render() {
    const { semester, tombstone, horizontalOrientation, moduleTableOrder } = this.props;
    let { modules } = this.props;

    // tombstone contains the data for the last deleted module. We insert it back
    // so that it gets sorted into its original location, then in renderModule()
    // takes care of rendering the tombstone
    if (tombstone) modules = [...modules, tombstone];
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
            key={module.ModuleCode}
          >
            {this.renderModule(module)}
          </div>
        ))}
      </div>
    );
  }
}

export default connect(
  (state) => ({ moduleTableOrder: state.settings.moduleTableOrder }),
  {
    selectModuleColor,
    hideLessonInTimetable,
    showLessonInTimetable,
  },
)(TimetableModulesTable);
