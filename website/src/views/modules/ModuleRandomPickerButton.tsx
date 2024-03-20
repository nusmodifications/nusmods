import * as React from 'react';
import classnames from 'classnames';
import { useHistory } from 'react-router-dom';

import { modulePage } from 'views/routes/paths';
import Tooltip from 'views/components/Tooltip';
import styles from './ModuleFinderPagerButton.scss';

type Props = {
  readonly tooltipTitle?: string;
  readonly disabled?: boolean;
  readonly active?: boolean;
  readonly children: React.ReactNode;
};

const ModuleRandomPickerButton: React.FC<Props> = ({
  tooltipTitle,
  disabled,
  active,
  children,
}) => {
    
  const rng = Math.floor(Math.random() * 100);
  const history = useHistory();
  const button = (
    <button
      type="button"
      className={classnames('btn', styles.pagerButton, {
        [styles.active]: active,
      })}
      disabled={disabled}
      onClick={() => history.push(modulePage('CS1010'))}
    >
      {children}
    </button>
  );
  return (
    <div>
      {tooltipTitle ? (
        <Tooltip content={tooltipTitle} delay={[800, 0]} touch="hold">
          {button}
        </Tooltip>
      ) : (
        button
      )}
    </div>
  );
};

export default ModuleRandomPickerButton;
