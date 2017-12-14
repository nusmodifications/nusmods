// @flow

import React, { PureComponent, type Node } from 'react';
import classnames from 'classnames';
import { Menu, Close } from 'views/components/icons';

import Fab from './Fab';
import styles from './SideMenu.scss';

type RenderMenu = (({ closeMenu: Function }) => Node) | Node;

type Props = {
  children: RenderMenu,
  openIcon: Node,
  closeIcon: Node,
};

type State = {
  isMenuOpen: boolean,
};

export const OPEN_MENU_LABEL = 'Open menu';
export const CLOSE_MENU_LABEL = 'Close menu';

export default class SideMenu extends PureComponent<Props, State> {
  static defaultProps = {
    openIcon: <Menu aria-label={OPEN_MENU_LABEL} />,
    closeIcon: <Close aria-label={CLOSE_MENU_LABEL} />,
  };

  state: State = {
    isMenuOpen: false,
  };

  closeMenu = () => this.setState({ isMenuOpen: false });

  render() {
    const { isMenuOpen } = this.state;
    const { children, openIcon, closeIcon } = this.props;

    const menu = typeof children === 'function'
      ? children({ closeMenu: this.closeMenu })
      : children;

    return (
      <div>
        <Fab
          className={styles.fab}
          onClick={() => this.setState({ isMenuOpen: !isMenuOpen })}
        >
          {isMenuOpen ? closeIcon : openIcon}
        </Fab>

        <div className={classnames(styles.sideMenu, { [styles.isOpen]: isMenuOpen })}>
          {menu}
        </div>
      </div>
    );
  }
}
