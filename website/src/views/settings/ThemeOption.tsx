import { Theme } from 'types/settings';

import * as React from 'react';
import { range } from 'lodash';
import classnames from 'classnames';

import styles from './ThemeOption.scss';

type Props = {
  theme: Theme;
  isSelected: boolean;
  onSelectTheme: (theme: Theme) => void;
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
      onClick={() => {
        onSelectTheme(theme);
      }}
    >
      <div>
        <small>{theme.name}</small>
      </div>
      <ul className={classnames('list-unstyled', styles.colorList)}>
        {range(theme.numOfColors).map((index) => (
          <li
            key={index}
            className={classnames(styles.colorItem, `color-${index}`)}
            style={{
              width: `${100 / theme.numOfColors}%`,
            }}
          />
        ))}
      </ul>
    </button>
  );
};

export default ThemeOption;
