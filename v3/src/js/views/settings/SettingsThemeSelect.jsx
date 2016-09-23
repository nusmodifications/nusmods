// @flow

import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import classnames from 'classnames';

import { changeTheme } from 'actions/theme';
import { NUM_DIFFERENT_COLORS } from 'reducers/theme';
import type { Theme } from 'types/views';

type Props = {
  theme: Theme,
  currentThemeId: string,

  changeTheme: Function,
};

function SettingsThemeSelect(props: Props) {
  return (
    <div className={classnames('col-sm-4 theme-item', {
      [`theme-${props.theme.id}`]: true,
      'is-selected': props.currentThemeId === props.theme.id,
    })}
      onClick={() => {
        props.changeTheme(props.theme.id);
      }}
    >
      <div>
        <small>{props.theme.name}</small>
      </div>
      <ul className="list-unstyled theme-color-list">
        {_.range(NUM_DIFFERENT_COLORS).map((index) => {
          return (
            <li key={index} className={`theme-color-item color-${index}`}/>
          );
        })}
      </ul>
    </div>
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
)(SettingsThemeSelect);
