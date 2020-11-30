import * as React from 'react';
import classnames from 'classnames';

import { Menu, X as Close } from 'react-feather';
import makeResponsive from 'views/hocs/makeResponsive';
import disableScrolling from 'utils/disableScrolling';
import { breakpointUp } from 'utils/css';
import Fab from './Fab';

import styles from './SideMenu.scss';

type Props = {
  children: React.ReactNode;
  openIcon?: React.ReactNode;
  closeIcon?: React.ReactNode;
  isOpen: boolean;
  matchBreakpoint: boolean;
  toggleMenu: (boolean: boolean) => void;
};

export const OPEN_MENU_LABEL = 'Open menu';
export const CLOSE_MENU_LABEL = 'Close menu';

export class SideMenuComponent extends React.PureComponent<Props> {
  static defaultProps = {
    openIcon: <Menu aria-label={OPEN_MENU_LABEL} />,
    closeIcon: <Close aria-label={CLOSE_MENU_LABEL} />,
  };

  componentDidMount() {
    disableScrolling(this.isSideMenuShown());
  }

  componentDidUpdate() {
    disableScrolling(this.isSideMenuShown());
  }

  componentWillUnmount() {
    // Force unset noscroll when unmounting so the user gets scrolling back if
    // they navigate out of the parent component without closing the menu
    disableScrolling(false);
  }

  isSideMenuShown() {
    return this.props.isOpen && !this.props.matchBreakpoint;
  }

  render() {
    const { isOpen, toggleMenu, children, openIcon, closeIcon } = this.props;

    return (
      <>
        <Fab className={styles.fab} onClick={() => toggleMenu(!isOpen)}>
          {isOpen ? closeIcon : openIcon}
        </Fab>

        {this.isSideMenuShown() && (
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
  }
}

export default makeResponsive(SideMenuComponent, breakpointUp('md'));
