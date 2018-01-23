// @flow

import React, { PureComponent, type Node, Fragment } from 'react';
import classnames from 'classnames';

import { Menu, Close } from 'views/components/icons';
import makeResponsive from 'views/hocs/makeResponsive';
import noScroll from 'utils/noScroll';
import { breakpointUp } from 'utils/css';
import Fab from './Fab';

import styles from './SideMenu.scss';

type Props = {
  children: Node,
  openIcon: Node,
  closeIcon: Node,
  isOpen: boolean,
  matchBreakpoint: boolean,
  toggleMenu: (boolean) => void,
};

export const OPEN_MENU_LABEL = 'Open menu';
export const CLOSE_MENU_LABEL = 'Close menu';

export class SideMenuComponent extends PureComponent<Props> {
  static defaultProps = {
    openIcon: <Menu aria-label={OPEN_MENU_LABEL} />,
    closeIcon: <Close aria-label={CLOSE_MENU_LABEL} />,
  };

  componentDidMount() {
    noScroll(this.isSideMenuShown());
  }

  componentDidUpdate() {
    noScroll(this.isSideMenuShown());
  }

  isSideMenuShown() {
    return this.props.isOpen && !this.props.matchBreakpoint;
  }

  render() {
    const { isOpen, toggleMenu, children, openIcon, closeIcon } = this.props;

    return (
      <Fragment>
        <Fab className={styles.fab} onClick={() => toggleMenu(!isOpen)}>
          {isOpen ? closeIcon : openIcon}
        </Fab>

        {this.isSideMenuShown() && (
          <div className={styles.overlay} onClick={() => toggleMenu(false)} />
        )}

        <div className={classnames(styles.sideMenu, { [styles.isOpen]: isOpen })}>{children}</div>
      </Fragment>
    );
  }
}

export default makeResponsive(SideMenuComponent, breakpointUp('md'));
