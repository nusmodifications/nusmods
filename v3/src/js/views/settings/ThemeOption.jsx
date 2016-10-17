// @flow
import type { Theme } from 'types/views';

import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';

import { NUM_DIFFERENT_COLORS } from 'reducers/theme';

type Props = {
  theme: Theme,
  isSelected: boolean,

  onSelectTheme: Function,
};

function ThemeOption(props: Props) {
  return (
    <div className={classnames('theme-option', {
      [`theme-${props.theme.id}`]: true,
      'is-selected': props.isSelected,
    })}
      onClick={() => {
        props.onSelectTheme(props.theme.id);
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
