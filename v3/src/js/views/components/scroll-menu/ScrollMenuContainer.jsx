// @flow

import type { Node } from 'react';

import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { entries, sortBy } from 'lodash';

import type { ScrollMenuId, ScrollMenuItemId } from 'types/reducers';
import { setMenuItem } from 'actions/scrollMenu';

type Props = {
  menuId: ScrollMenuId,
  children: Node,

  setMenuItem: (menuId: ScrollMenuItemId, itemId: ScrollMenuItemId) => void,
};

/**
 * Propagates down menuId to all ScrollItem and ScrollMenu components down the tree to
 * reduce repetition, and help set the correct initally highlighted menu item
 */
export class ScrollMenuContainerComponent extends PureComponent<Props> {
  props: Props;

  static childContextTypes = {
    menuId: PropTypes.string.isRequired,
    setInitialPosition: PropTypes.func.isRequired,
  };

  getChildContext() {
    return {
      menuId: this.props.menuId,
      setInitialPosition: (itemId: ScrollMenuItemId, position: number) => {
        this.initialPositions[itemId] = position;
      },
    };
  }

  componentDidMount() {
    // Update the current scroll menu item when the page is initially loaded. Pages can be loaded
    // with non-zero scroll position when they have a fragment or were already in the history stack
    // setTimeout() to force this to run after initial rendering
    setTimeout(() => {
      // Find the first fully visible item (initial position > 0). The currently selected menu item
      // should be the PREVIOUS item, since that is the first item on screen.
      const items = sortBy(entries(this.initialPositions), entry => entry[1]);
      if (!items.length) return;

      // If all items are off screen, use the last item
      const firstVisible = items.findIndex(([, position]) => position >= 0);
      const item = firstVisible == null ? items[items.length - 1] : items[firstVisible - 1];

      if (item) {
        this.props.setMenuItem(this.props.menuId, item[0]);
      }
    }, 0);
  }

  initialPositions: { [ScrollMenuItemId]: number } = {};

  render() {
    return this.props.children;
  }
}

export default connect(null, { setMenuItem })(ScrollMenuContainerComponent);
