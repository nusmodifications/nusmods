import classnames from 'classnames';
import { useCombobox } from 'downshift';
import type { FC } from 'react';
import {
  ChevronDown,
  ExternalLink as ExternalLinkIcon,
  Heart,
  Settings,
  Star,
  Trello,
} from 'react-feather';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

import ExternalLink from 'views/components/ExternalLink';
import { preload as preloadContribute } from 'views/contribute/ContributeContainer';
import type { State } from 'types/state';
import { Counter } from 'utils/react';

import styles from './NavDropdown.scss';

const NavDropdown: FC = () => {
  const beta = useSelector(({ settings }: State) => settings.beta);

  const { isOpen, getItemProps, getMenuProps, toggleMenu, highlightedIndex } = useCombobox<unknown>(
    { items: [] },
  );

  const counter = new Counter();

  return (
    <div className={styles.navDropdown}>
      <button
        className={classnames(styles.toggle, 'btn btn-svg')}
        type="button"
        onClick={() => toggleMenu()}
      >
        <ChevronDown className={classnames(styles.buttonIcon)} />
      </button>

      <div
        className={classnames('dropdown-menu', styles.dropdownMenu, { show: isOpen })}
        {...getMenuProps()}
      >
        {beta && (
          <>
            <div {...getItemProps({ item: undefined, index: counter.count + 1 })}>
              <NavLink
                className={classnames(styles.item, styles.hiddenOnMobile, 'dropdown-item', {
                  'dropdown-selected': counter.matches(highlightedIndex),
                })}
                to="/planner"
              >
                <span className={styles.itemContents}>
                  <Trello className={styles.leftIcon} />
                  <span className={styles.title}>Planner</span>
                  <span className={classnames('badge badge-info', styles.rightContent)}>Beta</span>
                </span>
              </NavLink>
              <div className={classnames(styles.hiddenOnMobile, 'dropdown-divider')} />
            </div>
          </>
        )}
        <div {...getItemProps({ item: undefined, index: counter.count + 1 })}>
          <NavLink
            className={classnames(styles.item, 'dropdown-item', {
              'dropdown-selected': counter.matches(highlightedIndex),
            })}
            to="/settings"
          >
            <span className={styles.itemContents}>
              <Settings className={styles.leftIcon} />
              <span className={styles.title}>Settings</span>
            </span>
          </NavLink>
        </div>
        <div {...getItemProps({ item: undefined, index: counter.count + 1 })}>
          <NavLink
            className={classnames(styles.item, 'dropdown-item', {
              'dropdown-selected': counter.matches(highlightedIndex),
            })}
            onMouseOver={preloadContribute}
            onFocus={preloadContribute}
            to="/contribute"
          >
            <span className={styles.itemContents}>
              <Star className={styles.leftIcon} />
              <span className={styles.title}>Contribute</span>
            </span>
          </NavLink>
        </div>
        <div className="dropdown-divider" />
        <div {...getItemProps({ item: undefined, index: counter.count + 1 })}>
          <ExternalLink
            href="https://nuswhispers.com"
            className={classnames(styles.item, 'dropdown-item', {
              'dropdown-selected': counter.matches(highlightedIndex),
            })}
          >
            <span className={styles.itemContents}>
              <Heart className={styles.leftIcon} />
              <span className={styles.title}>Whispers</span>
              <ExternalLinkIcon
                className={classnames(styles.rightContent, styles.rightContentIcon)}
              />
            </span>
          </ExternalLink>
        </div>
      </div>
    </div>
  );
};

export default NavDropdown;
