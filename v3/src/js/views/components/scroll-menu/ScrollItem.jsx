// @flow

import type { Node } from 'react';
import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import Waypoint from 'react-waypoint';
import { omit } from 'lodash';

import type { ScrollMenuItem, ScrollMenuId, ScrollMenuItemId } from 'types/reducers';
import { createMenuItem, addMenuItem, nextMenuItem, prevMenuItem } from 'actions/scrollMenu';

type Props = {
  children: Node,
  menuId: string,
  label: string,
  topOffset?: number | string,
  bottomOffset?: number | string,
  className?: string,
  id?: string,

  addMenuItem: (ScrollMenuId, string | ScrollMenuItem) => void,
  nextMenuItem: (ScrollMenuId, ScrollMenuItemId) => void,
  prevMenuItem: (ScrollMenuId, ScrollMenuItemId) => void,
};

const mapDispatchToProps = {
  addMenuItem,
  nextMenuItem,
  prevMenuItem,
};

const ownProps = [
  'children',
  'menuId',
  'label',
  'id',
  'className',
  'topOffset',
  'bottomOffset',
].concat(Object.keys(mapDispatchToProps));

export class ScrollItemComponent extends PureComponent<Props> {
  props: Props;

  componentDidMount() {
    this.props.addMenuItem(this.props.menuId, this.menuItem());
  }

  updateMenu = ({ currentPosition, previousPosition }: Waypoint.CallbackArgs) => {
    if (currentPosition === Waypoint.above && previousPosition === Waypoint.inside) {
      this.props.nextMenuItem(this.props.menuId, this.menuItem().id);
    }

    if (currentPosition === Waypoint.inside && previousPosition === Waypoint.above) {
      this.props.prevMenuItem(this.props.menuId, this.menuItem().id);
    }
  };

  menuItem() {
    const { id, label } = this.props;
    return createMenuItem(label, id);
  }

  render() {
    const item = this.menuItem();
    const otherProps = omit(this.props, ownProps);

    return (
      <Waypoint
        onPositionChange={this.updateMenu}
        topOffset={this.props.topOffset}
        bottomOffset={this.props.bottomOffset}
      >
        <div
          id={item.id}
          className={classnames(this.props.className, 'scroll-menu-item-wrapper')}
          {...otherProps}
        >
          {this.props.children}
        </div>
      </Waypoint>
    );
  }
}

export default connect(null, mapDispatchToProps)(ScrollItemComponent);
