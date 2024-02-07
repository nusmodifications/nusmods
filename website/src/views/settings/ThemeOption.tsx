import * as React from 'react';
import { range } from 'lodash';
import classnames from 'classnames';
import { Theme, ThemeId } from 'types/settings';

import { NUM_DIFFERENT_COLORS } from 'utils/colors';
import styles from './ThemeOption.scss';

type Props = {
  theme: Theme;
  isSelected: boolean;
  onSelectTheme: (themeId: ThemeId) => void;
  className?: string;
};

const ThemeOption: React.FC<Props> = (props) => {
  const { theme, isSelected, onSelectTheme, className } = props;

  return (
    <button
      type="button"
      className={classnames(className, styles.option, `theme-${theme.id}`, {
        [styles.isSelected]: isSelected,
      })}
      onClick={() => onSelectTheme(theme.id)}
    >
      <div>
        <small>{theme.name}</small>
      </div>
      <ul className={classnames('list-unstyled', styles.colorList)}>
        {range(NUM_DIFFERENT_COLORS).map((index) => (
          <li key={index} className={classnames(styles.colorItem, `hoverable color-${index}`)} />
        ))}
      </ul>
    </button>
  );
};

export default ThemeOption;
