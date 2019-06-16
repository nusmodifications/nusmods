import React from 'react';
import classnames from 'classnames';

import styles from './ModuleFinderPagerButton.scss';

type Props = {
  readonly disabled?: boolean;
  readonly active?: boolean;
  readonly onClick: () => void;
  readonly children: React.ReactNode;
};

const ModuleFinderPagerButton: React.FC<Props> = ({ disabled, active, onClick, children }) => (
  <li>
    <button
      type="button"
      className={classnames(
        'btn',
        styles.pagerButton,
        disabled && styles.disabled,
        active && styles.active,
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  </li>
);

export default ModuleFinderPagerButton;
