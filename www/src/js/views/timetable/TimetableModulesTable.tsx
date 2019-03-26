import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import { sortBy } from 'lodash';

import { ModuleWithColor } from 'types/views';
import { ColorIndex } from 'types/timetables';
import { ModuleCode, Semester } from 'types/modules';

import ColorPicker from 'views/components/ColorPicker';
import { Eye, EyeOff, Trash } from 'views/components/icons';
import {
  hideLessonInTimetable,
  selectModuleColor,
  showLessonInTimetable,
} from 'actions/timetables';
import { getExamDate, getFormattedExamDate, renderMCs } from 'utils/modules';
import { modulePage } from 'views/routes/paths';
import elements from 'views/elements';
import Tooltip from 'views/components/Tooltip';
import { State as StoreState } from 'types/state';

import { ModuleTableOrder } from 'types/reducers';
import styles from './TimetableModulesTable.scss';
import ModuleTombstone from './ModuleTombstone';
import { moduleOrders } from './ModulesTableFooter';

type Props = {
  semester: Semester;
  readOnly: boolean;
  horizontalOrientation: boolean;
  moduleTableOrder: ModuleTableOrder;
  modules: ModuleWithColor[];
  tombstone: ModuleWithColor | null; // Placeholder for a deleted module

  // Actions
  selectModuleColor: (semester: Semester, moduleCode: ModuleCode, colorIndex: ColorIndex) => void;
  hideLessonInTimetable: (semester: Semester, moduleCode: ModuleCode) => void;
  showLessonInTimetable: (semester: Semester, moduleCode: ModuleCode) => void;
  onRemoveModule: (moduleWithColor: ModuleWithColor) => void;
  resetTombstone: () => void;
};

class TimetableModulesTable extends React.PureComponent<Props> {
  renderModuleActions(module: ModuleWithColor) {
    const hideBtnLabel = `${module.hiddenInTimetable ? 'Show' : 'Hide'} ${module.moduleCode}`;
    const removeBtnLabel = `Remove ${module.moduleCode} from timetable`;
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
                  this.props.showLessonInTimetable(semester, module.moduleCode);
                } else {
                  this.props.hideLessonInTimetable(semester, module.moduleCode);
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

  renderModule = (module: ModuleWithColor) => {
    const { semester, readOnly, tombstone, resetTombstone } = this.props;

    if (tombstone && tombstone.moduleCode === module.moduleCode) {
      return <ModuleTombstone module={module} resetTombstone={resetTombstone} />;
    }

    return (
      <>
        <div className={styles.moduleColor}>
          <ColorPicker
            label={`Change ${module.moduleCode} timetable color`}
            color={module.colorIndex}
            isHidden={module.hiddenInTimetable}
            onChooseColor={(colorIndex: ColorIndex) => {
              this.props.selectModuleColor(semester, module.moduleCode, colorIndex);
            }}
          />
        </div>
        <div className={styles.moduleInfo}>
          {!readOnly && this.renderModuleActions(module)}
          <Link to={modulePage(module.moduleCode, module.title)}>
            {module.moduleCode} {module.title}
          </Link>
          <div className={styles.moduleExam}>
            {getExamDate(module, semester)
              ? `Exam: ${getFormattedExamDate(module, semester)}`
              : 'No Exam'}
            &nbsp;&middot;&nbsp;
            {renderMCs(module.moduleCredit)}
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
            key={module.moduleCode}
          >
            {this.renderModule(module)}
          </div>
        ))}
      </div>
    );
  }
}

export default connect(
  (state: StoreState) => ({ moduleTableOrder: state.settings.moduleTableOrder }),
  {
    selectModuleColor,
    hideLessonInTimetable,
    showLessonInTimetable,
  },
)(TimetableModulesTable);
