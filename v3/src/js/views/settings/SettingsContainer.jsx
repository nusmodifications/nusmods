// @flow

import React from 'react';
import DocumentTitle from 'react-document-title';
import config from 'config';

import availableThemes from 'data/themes.json';

import SettingsThemeSelect from './SettingsThemeSelect';

function SettingsContainer() {
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
                return <SettingsThemeSelect key={theme.id} theme={theme}/>;
              })}
            </div>
          </div>
        </div>
      </div>
    </DocumentTitle>
  );
}

export default SettingsContainer;
