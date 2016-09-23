// @flow

import React from 'react';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import config from 'config';

import { changeTheme } from 'actions/theme';
import availableThemes from 'data/themes.json';

import ThemeOption from './ThemeOption';

type Props = {
  currentThemeId: string,

  changeTheme: Function,
};

function SettingsContainer(props: Props) {
  return (
    <DocumentTitle title={`Settings - ${config.brandName}`}>
      <div className="settings-page-container page-container">
        <h1 className="display-4">Settings</h1>
        <hr/>
        <div className="row">
          <div className="col-sm-2">
            <h4>Theme</h4>
          </div>
          <div className="col-sm-10">
            <div className="row">
              {availableThemes.map((theme) => {
                return (
                  <ThemeOption key={theme.id}
                    theme={theme}
                    changeTheme={props.changeTheme}
                    isSelected={props.currentThemeId === theme.id}
                  />);
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
    currentThemeId: state.theme.id,
  };
}

export default connect(
  mapStateToProps,
  {
    changeTheme,
  }
)(SettingsContainer);
