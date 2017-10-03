// @flow

import type { Node } from 'react';
import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import Waypoint from 'react-waypoint';
import { omit } from 'lodash';

import type { ScrollMenuItem, ScrollMenuId, ScrollMenuItemId } from 'types/reducers';
import { createMenuItem, addMenuItem, nextMenuItem, setMenuItem } from 'actions/scrollMenu';
import withScrollMenu from './withScrollMenu';

type Props = {
  children: Node,
  menuId: string,
  label: string,
  topOffset?: number | string,
  bottomOffset?: number | string,
  className?: string,
  id?: string,

  setInitialPosition: (ScrollMenuItemId, number) => any,
  addMenuItem: (ScrollMenuId, string | ScrollMenuItem) => void,
  nextMenuItem: (ScrollMenuId, ScrollMenuItemId) => void,
  setMenuItem: (ScrollMenuId, ScrollMenuItemId) => void,
};

const mapDispatchToProps = {
  addMenuItem,
  nextMenuItem,
  setMenuItem,
};

const ownProps = [
  'children',
  'menuId',
  'label',
  'id',
  'className',
  'topOffset',
  'bottomOffset',
  'setInitialPosition',
].concat(Object.keys(mapDispatchToProps));

export class ScrollItemComponent extends PureComponent<Props> {
  props: Props;

  componentWillMount() {
    this.props.addMenuItem(this.props.menuId, this.menuItem());
  }

  updateMenu = ({ currentPosition, previousPosition, waypointTop }: Waypoint.CallbackArgs) => {
    if (!previousPosition) {
      this.props.setInitialPosition(this.menuItem().id, waypointTop);
    }

    if (currentPosition === Waypoint.above && previousPosition === Waypoint.inside) {
      this.props.nextMenuItem(this.props.menuId, this.menuItem().id);
    }

    if (currentPosition === Waypoint.inside && previousPosition === Waypoint.above) {
      this.props.setMenuItem(this.props.menuId, this.menuItem().id);
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

export default withScrollMenu(
  connect(null, mapDispatchToProps)(ScrollItemComponent),
);
