import { memo, FC, useEffect, useCallback } from 'react';
import classnames from 'classnames';

import { Menu, X as Close } from 'react-feather';
import useMediaQuery from 'views/hooks/useMediaQuery';
import disableScrolling from 'utils/disableScrolling';
import { breakpointUp } from 'utils/css';
import Fab from './Fab';

import styles from './SideMenu.scss';

type Props = {
  children: React.ReactNode;
  openIcon?: React.ReactNode;
  closeIcon?: React.ReactNode;
  isOpen: boolean;
  toggleMenu: (boolean: boolean) => void;
};

export const OPEN_MENU_LABEL = 'Open menu';
export const CLOSE_MENU_LABEL = 'Close menu';

const DEFAULT_OPEN_ICON = <Menu aria-label={OPEN_MENU_LABEL} />;
const DEFAULT_CLOSE_ICON = <Close aria-label={CLOSE_MENU_LABEL} />;

export const SideMenuComponent: FC<Props> = ({
  openIcon = DEFAULT_OPEN_ICON,
  closeIcon = DEFAULT_CLOSE_ICON,
  isOpen,
  toggleMenu,
  children,
}) => {
  const matchBreakpoint = useMediaQuery(breakpointUp('md'));

  const isSideMenuShown = isOpen && !matchBreakpoint;

  useEffect(() => {
    disableScrolling(isSideMenuShown);
    return () => disableScrolling(false);
  });

  return (
    <>
      <Fab className={styles.fab} onClick={() => toggleMenu(!isOpen)}>
        {isOpen ? closeIcon : openIcon}
      </Fab>

      {isSideMenuShown && (
        // Key events are not sent to this div.
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <div className={styles.overlay} onClick={() => toggleMenu(false)} />
      )}

      {/* boundaryContainer defines the top and bottom boundaries which sideMenu can extend to */}
      <div className={styles.boundaryContainer}>
        {/*
            sideMenu is the scrollable menu element. On mobile, it expands
            from the bottom of the screen to the top boundary of the
            container; i.e. if the menu's content is shorter than the
            container, it'll appear as a little action sheet rising from the
            bottom of the screen.
          */}
        <div className={classnames(styles.sideMenu, { [styles.isOpen]: isOpen })}>{children}</div>
      </div>
    </>
  );
};

export default memo(SideMenuComponent);
