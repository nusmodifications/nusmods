// @flow
import type { Theme, ThemeId } from 'types/settings';

import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';

import { NUM_DIFFERENT_COLORS } from 'utils/colors';
import styles from './ThemeOption.scss';

type Props = {
  theme: Theme,
  isSelected: boolean,
  onSelectTheme: ThemeId => void,
  className?: string,
};

export default function ThemeOption(props: Props) {
  const { theme, isSelected, onSelectTheme, className } = props;

  return (
    <div
      className={classnames(className, styles.option, `theme-${theme.id}`, {
        [styles.isSelected]: isSelected,
      })}
      onClick={() => onSelectTheme(theme.id)}
    >
      <div>
        <small>{theme.name}</small>
      </div>
      <ul className={classnames('list-unstyled', styles.colorList)}>
        {_.range(NUM_DIFFERENT_COLORS).map((index) => (
          <li key={index} className={classnames(styles.colorItem, `color-${index}`)} />
        ))}
      </ul>
    </div>
  );
}
