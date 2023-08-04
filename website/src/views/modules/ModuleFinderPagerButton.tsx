import * as React from 'react';
import classnames from 'classnames';

import Tooltip from 'views/components/Tooltip';
import styles from './ModuleFinderPagerButton.scss';

type Props = {
  readonly tooltipTitle?: string;
  readonly disabled?: boolean;
  readonly active?: boolean;
  readonly onClick: () => void;
  readonly children: React.ReactNode;
};

const ModuleFinderPagerButton: React.FC<Props> = ({
  tooltipTitle,
  disabled,
  active,
  onClick,
  children,
}) => {
  const button = (
    <button
      type="button"
      className={classnames('btn', styles.pagerButton, {
        [styles.active!]: active,
      })}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
  return (
    <li>
      {tooltipTitle ? (
        <Tooltip content={tooltipTitle} delay={[800, 0]} touch="hold">
          {button}
        </Tooltip>
      ) : (
        button
      )}
    </li>
  );
};

export default ModuleFinderPagerButton;
