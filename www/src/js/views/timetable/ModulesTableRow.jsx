// @flow
import React, { PureComponent, Fragment } from 'react';
import { Link } from 'react-router-dom';

import type { ModuleWithColor } from 'types/modules';
import type { ColorIndex } from 'types/reducers';

import ColorPicker from 'views/components/ColorPicker';
import { Eye, EyeOff, Trash2 } from 'views/components/icons/index';
import { modulePage } from 'views/routes/paths';

import styles from './ModulesTableRow.scss';

type Props = {
  onSelectModuleColor: Function,
  onHideModule: Function,
  onShowModule: Function,
  onRemoveModule: Function,
  module: ModuleWithColor,
  exam: string,
  readOnly: boolean,
};

class ModulesTableRow extends PureComponent<Props> {
  render() {
    const { module, exam } = this.props;

    const hideBtnLabel = `${module.hiddenInTimetable ? 'Show' : 'Hide'} ${module.ModuleCode}`;
    const removeBtnLabel = `Remove ${module.ModuleCode} from timetable`;
    return (
      <tr className={styles.row}>
        <td className={styles.color}>
          <ColorPicker
            label={`Change ${module.ModuleCode} timetable color`}
            color={module.colorIndex}
            onChooseColor={(colorIndex: ColorIndex) => {
              this.props.onSelectModuleColor(module.ModuleCode, colorIndex);
            }}
          />
        </td>
        <td className={styles.title}>
          <Link to={modulePage(module.ModuleCode, module.ModuleTitle)}>
            {module.ModuleCode} {module.ModuleTitle}
          </Link>
        </td>
        <td className={styles.credit}>{module.ModuleCredit}</td>
        <td className={styles.exam}>{exam}</td>
        <td className={styles.action}>
          {!this.props.readOnly && (
            <Fragment>
              <button
                className={styles.actionButton}
                title={removeBtnLabel}
                aria-label={removeBtnLabel}
                onClick={() => {
                  if (window.confirm(`Are you sure you want to remove ${module.ModuleCode}?`)) {
                    this.props.onRemoveModule(module.ModuleCode);
                  }
                }}
              >
                <Trash2 className="svg-small" />
              </button>
              <button
                className={styles.actionButton}
                title={hideBtnLabel}
                aria-label={hideBtnLabel}
                onClick={() => {
                  if (module.hiddenInTimetable) {
                    this.props.onShowModule(module.ModuleCode);
                  } else {
                    this.props.onHideModule(module.ModuleCode);
                  }
                }}
              >
                {module.hiddenInTimetable ? (
                  <Eye className="svg-small" />
                ) : (
                  <EyeOff className="svg-small" />
                )}
              </button>
            </Fragment>
          )}
        </td>
      </tr>
    );
  }
}

export default ModulesTableRow;
