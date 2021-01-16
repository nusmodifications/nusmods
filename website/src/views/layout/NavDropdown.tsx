import classnames from 'classnames';
import Downshift, { ChildrenFunction } from 'downshift';
import React, { FC, useCallback } from 'react';
import { ChevronDown, Heart, Settings, Star } from 'react-feather';
import { NavLink } from 'react-router-dom';

import ExternalLink from 'views/components/ExternalLink';
import { preload as preloadContribute } from 'views/contribute/ContributeContainer';
import { Counter } from 'utils/react';

import styles from './NavDropdown.scss';
import navtabsStyles from './Navtabs.scss';

const tabProps = {
  className: classnames(navtabsStyles.link, 'dropdown-item'),
  activeClassName: navtabsStyles.linkActive,
};

const NavDropdown: FC = () => {
  const renderDropdown = useCallback<ChildrenFunction<never>>(
    ({ isOpen, getItemProps, getMenuProps, toggleMenu, highlightedIndex }) => {
      const counter = new Counter();

      return (
        <div className={styles.navDropdown}>
          <button
            className={classnames(styles.toggle, 'btn btn-svg')}
            type="button"
            onClick={() => toggleMenu()}
          >
            <ChevronDown className={classnames(styles.icon)} />
          </button>

          <div
            className={classnames('dropdown-menu', styles.dropdownMenu, { show: isOpen })}
            {...getMenuProps()}
          >
            <NavLink
              className={classnames('dropdown-item', {
                'dropdown-selected': counter.matches(highlightedIndex),
              })}
              to="/settings"
            >
              <Settings />
              <span className={styles.title}>Settings</span>
            </NavLink>
            <NavLink
              className={classnames('dropdown-item', {
                'dropdown-selected': counter.matches(highlightedIndex),
              })}
              onMouseOver={preloadContribute}
              onFocus={preloadContribute}
              to="/contribute"
            >
              <Star />
              <span className={styles.title}>Contribute</span>
            </NavLink>
            <div className="dropdown-divider" />
            <ExternalLink
              href="https://nuswhispers.com"
              className={classnames('dropdown-item', {
                'dropdown-selected': counter.matches(highlightedIndex),
              })}
            >
              <Heart />
              <span className={styles.title}>Whispers</span>
            </ExternalLink>
          </div>
        </div>
      );
    },
    [],
  );

  return <Downshift>{renderDropdown}</Downshift>;
};

export default NavDropdown;
