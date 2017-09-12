// @flow
import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';

import type { Theme } from 'types/views';

import { NUM_DIFFERENT_COLORS } from 'reducers/theme';

type Props = {
  theme: Theme,
  isSelected: boolean,

  onSelectTheme: Function,
};

function ThemeOption(props: Props) {
  const { theme, isSelected, onSelectTheme } = props;

  return (
    <div
      className={classnames('theme-option', `theme-${theme.id}`, {
        'is-selected': isSelected,
      })}
      onClick={() => onSelectTheme(theme.id)}
    >
      <div>
        <small>{theme.name}</small>
      </div>
      <ul className="list-unstyled theme-color-list">
        {_.range(NUM_DIFFERENT_COLORS).map(index => (
          <li key={index} className={`theme-color-item color-${index}`} />
        ))}
      </ul>
    </div>
  );
}

export default ThemeOption;
