// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import type { ScrollMenu, ScrollMenuId } from 'types/reducers';
import { clearMenuState } from 'actions/scrollMenu';

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

    if (!menu) {
      return null;
    }

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

const mapStateToProps = (state, ownProps) => {
  return {
    menu: state.scrollMenu[ownProps.menuId],
  };
};

export default connect(mapStateToProps, { clearMenuState })(ScrollMenuComponent);
