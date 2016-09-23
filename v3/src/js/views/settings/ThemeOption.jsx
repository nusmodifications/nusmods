// @flow

import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';

import { NUM_DIFFERENT_COLORS } from 'reducers/theme';
import type { Theme } from 'types/views';

type Props = {
  theme: Theme,
  isSelected: boolean,

  changeTheme: Function,
};

function ThemeOption(props: Props) {
  return (
    <div className={classnames('col-sm-4 theme-item', {
      [`theme-${props.theme.id}`]: true,
      'is-selected': props.isSelected,
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

export default ThemeOption;
