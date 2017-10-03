// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import type { ScrollMenu, ScrollMenuId } from 'types/reducers';
import { clearMenuState } from 'actions/scrollMenu';
import withScrollMenu from './withScrollMenu';

type Props = {
  menu: ?ScrollMenu,

  clearMenuState: (ScrollMenuId) => void,
};

export class ScrollMenuComponent extends PureComponent<Props> {
  props: Props;

  componentWillUnmount() {
    const { menu } = this.props;
    if (menu) this.props.clearMenuState(menu.id);
  }

  render() {
    const { menu } = this.props;
    if (!menu) return null;

    return (
      <ul>
        {menu.items.map((item, index) => (
          <li
            key={item.id}
            className={classnames({ 'scroll-menu-link-active': index === menu.currentIndex })}
          >
            <a href={`#${item.id}`}>{item.label}</a>
          </li>
        ))}
      </ul>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  menu: state.scrollMenu[ownProps.menuId],
});

export default withScrollMenu(
  connect(mapStateToProps, { clearMenuState })(ScrollMenuComponent),
);
