// @flow

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import type { ScrollMenu } from 'types/reducers';

type Props = {
  menu: ScrollMenu,
};

export class ScrollMenuComponent extends PureComponent<Props> {
  props: Props;

  render() {
    const { menu } = this.props;

    console.log('Rendering menu', menu);

    if (!menu) return null;

    return (
      <ul>
        {menu.items.map(item => (
          <li>
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

export default connect(mapStateToProps)(ScrollMenuComponent);
