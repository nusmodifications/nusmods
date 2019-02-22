import React from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';

import Tooltip from 'views/components/Tooltip/Tooltip';
import styles from './Navtabs.scss';

type Props = NavLinkProps & {
  label: string;
  hideLabel: boolean;
  onHover?: () => void;
};

/**
 * Represents a single item on the navtabs list
 */
function NavtabLink({ children, label, hideLabel, onHover, ...otherProps }: Props) {
  return (
    <Tooltip isEnabled={hideLabel} content={label} placement="bottom" touchHold>
      <NavLink onMouseOver={onHover} onFocus={onHover} {...otherProps}>
        {children}
        {!hideLabel && <div className={styles.title}>{label}</div>}
      </NavLink>
    </Tooltip>
  );
}

export default NavtabLink;
