// @flow
import type { ModuleWithColor, ModuleCode } from 'types/modules';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import classnames from 'classnames';
import ColorPicker from 'views/components/color-picker/ColorPicker';

import { selectModuleColor, modifyModuleColor, cancelModifyModuleColor } from 'actions/theme';
import { getModuleSemExamDate, modulePagePath } from 'utils/modules';

type Props = {
  activeModule: ModuleCode,
  selectModuleColor: Function,
  modifyModuleColor: Function,
  cancelModifyModuleColor: Function,
  semester: number,
  modules: Array<ModuleWithColor>,
  onRemoveModule: Function,
  horizontalOrientation: boolean,
};

class TimetableModulesTable extends Component {
  componentWillUnmount() {
    this.props.cancelModifyModuleColor();
  }

  props: Props;

  render() {
    return (
      <div className="modules-table row">
        {this.props.modules.length ?
          this.props.modules.map((module) => {
            return (
              <div className={classnames('modules-table-row', {
                'col-md-4': this.props.horizontalOrientation,
                'col-md-12': !this.props.horizontalOrientation,
              })}
                key={module.ModuleCode}
              >
                <div className="modules-table-row-inner">
                  <div className="color-column">
                    <div className={`modules-table-color color-${module.colorIndex}`}
                      onClick={() => {
                        if (this.props.activeModule === module.ModuleCode) {
                          this.props.cancelModifyModuleColor();
                        } else {
                          this.props.modifyModuleColor(module.ModuleCode);
                        }
                      }}/>
                    {this.props.activeModule === module.ModuleCode &&
                      <ColorPicker onChooseColor={(colorIndex: number) => {
                        this.props.selectModuleColor(module.ModuleCode, colorIndex);
                      }}/>
                    }
                  </div>
                  <div className="module-details-column">
                    <Link to={modulePagePath(module.ModuleCode)}>
                      {module.ModuleCode} {module.ModuleTitle}
                    </Link>
                    <div>
                      <small>
                        Exam: {getModuleSemExamDate(module, this.props.semester)}
                        &nbsp;&middot;&nbsp;
                        {module.ModuleCredit} MCs
                        &nbsp;&middot;&nbsp;
                        <span className="btn-remove" onClick={() => {
                          this.props.onRemoveModule(module.ModuleCode);
                        }}>
                          Remove
                        </span>
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
          : <p className="text-sm-center">No modules added.</p>
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeModule: state.app.activeModule,
  };
}

export default connect(
  mapStateToProps,
  {
    selectModuleColor,
    modifyModuleColor,
    cancelModifyModuleColor,
  }
)(TimetableModulesTable);
