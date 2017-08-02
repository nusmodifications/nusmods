// @flow
import type { Faculty } from 'types/modules';

import React from 'react';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import config from 'config';

import { selectTheme } from 'actions/theme';
import { selectNewStudent, selectFaculty } from 'actions/settings';
import availableThemes from 'data/themes.json';
import FacultySelect from 'views/components/FacultySelect';
import NewStudentSelect from 'views/components/NewStudentSelect';

import ThemeOption from './ThemeOption';

type Props = {
  newStudent: boolean,
  faculty: Faculty,
  currentThemeId: string,

  selectTheme: Function,
  selectNewStudent: Function,
  selectFaculty: Function,
};

function SettingsContainer(props: Props) {
  return (
    <DocumentTitle title={`Settings - ${config.brandName}`}>
      <div className="settings-page-container page-container">
        <div className="row">
          <div className="col-md-8 offset-md-1">
            <h1 className="page-title">Settings</h1>
            <h4>New Student</h4>
            <div className="row">
              <div className="col-sm-7 col-xs-7">
                <p>For certain modules, places are reserved for new students in CORS Bidding Rounds 1 and 2,
                recognizing that new students do not have as many points as some of the seniors.</p>
              </div>
              <div className="col-sm-4 offset-sm-1 col-xs-5 text-xs-right">
                <NewStudentSelect
                  newStudent={props.newStudent}
                  onSelectNewStudent={props.selectNewStudent}
                />
              </div>
            </div>
            <hr />
            <h4>Faculty</h4>
            <div className="row">
              <div className="col-sm-7">
                <p>CEG Students are to select <strong>Joint Multi-Disciplinary Program</strong> due to the
                unique nature of their course.</p>
              </div>
              <div className="col-sm-4 offset-sm-1 text-xs-right">
                <FacultySelect faculty={props.faculty} onChange={props.selectFaculty} />
              </div>
            </div>
            <hr />
            <h4>Theme</h4>
            <div>
              {availableThemes.map((theme) => {
                return (
                  <div className="theme-option-container"key={theme.id}>
                    <ThemeOption
                      theme={theme}
                      isSelected={props.currentThemeId === theme.id}
                      onSelectTheme={props.selectTheme}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DocumentTitle>
  );
}

function mapStateToProps(state) {
  return {
    newStudent: state.settings.newStudent,
    faculty: state.settings.faculty,
    currentThemeId: state.theme.id,
  };
}

export default connect(
  mapStateToProps,
  {
    selectTheme,
    selectNewStudent,
    selectFaculty,
  },
)(SettingsContainer);
