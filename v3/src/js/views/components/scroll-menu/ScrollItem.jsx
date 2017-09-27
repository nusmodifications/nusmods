// @flow

import type { Node } from 'react';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Waypoint from 'react-waypoint';
import { omit } from 'lodash';

import type { ScrollMenuItem, ScrollMenuId, ScrollMenuItemId } from 'types/reducers';
import { createMenuItem, addMenuItem, updateMenuState } from 'actions/scrollMenu';

type Props = {
  children: Node,
  menuId: string,
  label: string,
  id?: string,

  updateMenuState: (menuId: ScrollMenuId, itemId: ScrollMenuItemId) => void,
  addMenuItem: (menuId: ScrollMenuId, itemOrLabel: string | ScrollMenuItem) => void,
};

export class ScrollItemComponent extends PureComponent<Props> {
  props: Props;

  componentDidMount() {
    this.props.addMenuItem(this.props.menuId, this.menuItem());
  }

  updateMenu = () => {
    this.props.updateMenuState(this.props.menuId, this.menuItem().id);
  };

  menuItem() {
    const { id, label } = this.props;
    return createMenuItem(label, id);
  }

  render() {
    const item = this.menuItem();
    const otherProps = omit(this.props, ['children', 'menuId', 'label', 'id', 'updateMenuState', 'addMenuItem']);

    return (
      <Waypoint onEnter={this.updateMenu}>
        <div id={item.id} {...otherProps}>{this.props.children}</div>
      </Waypoint>
    );
  }
}

export default connect(null, { updateMenuState, addMenuItem })(ScrollItemComponent);
