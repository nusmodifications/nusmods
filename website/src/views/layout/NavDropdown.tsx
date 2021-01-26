import classnames from 'classnames';
import Downshift, { ChildrenFunction } from 'downshift';
import type { FC } from 'react';
import {
  Calendar,
  Droplet,
  ExternalLink as ExternalLinkIcon,
  Heart,
  Menu,
  Settings,
  Star,
  Trello,
} from 'react-feather';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import NUSModerator from 'nusmoderator';

import ExternalLink from 'views/components/ExternalLink';
import { preload as preloadContribute } from 'views/contribute/ContributeContainer';
import type { State } from 'types/state';
import weekText from 'utils/weekText';

import styles from './NavDropdown.scss';

// Only compute this on page load.
const { year } = NUSModerator.academicCalendar.getAcadWeekInfo(new Date());
const baseYearNumber = parseInt(year.slice(0, 2), 10);

const NavDropdown: FC = () => {
  const beta = useSelector(({ settings }: State) => settings.beta);

  const renderDropdown: ChildrenFunction<never> = ({
    isOpen,
    getMenuProps,
    toggleMenu,
    closeMenu,
  }) => {
    const itemProps = {
      className: classnames(styles.item, 'dropdown-item'),
      onClick: () => closeMenu(),
    };
    return (
      <div className={styles.container}>
        <button
          className={classnames(styles.toggle, 'btn btn-svg')}
          type="button"
          onClick={() => toggleMenu()}
        >
          <Menu className={classnames(styles.buttonIcon)} />
        </button>

        <div
          className={classnames('dropdown-menu', styles.dropdownMenu, { show: isOpen })}
          {...getMenuProps()}
        >
          {beta && (
            <>
              <NavLink {...itemProps} to="/planner">
                <Trello className={styles.leftIcon} />
                <span className={styles.title}>Planner</span>
                <span className={classnames('badge badge-info', styles.rightContent)}>Beta</span>
              </NavLink>
              <div className="dropdown-divider" />
            </>
          )}
          <NavLink {...itemProps} to="/settings">
            <Settings className={styles.leftIcon} />
            <span className={styles.title}>Settings</span>
          </NavLink>
          <NavLink
            {...itemProps}
            onMouseOver={preloadContribute}
            onFocus={preloadContribute}
            to="/contribute"
          >
            <Star className={styles.leftIcon} />
            <span className={styles.title}>Contribute</span>
          </NavLink>
          <div className="dropdown-divider" />
          <ExternalLink {...itemProps} href="https://nusbusiness.com">
            <Droplet className={styles.leftIcon} />
            <span className={styles.title}>NUS Business</span>
            <ExternalLinkIcon
              className={classnames(styles.rightContent, styles.rightContentIcon)}
            />
          </ExternalLink>
          <ExternalLink {...itemProps} href="https://nuswhispers.com">
            <Heart className={styles.leftIcon} />
            <span className={styles.title}>NUSWhispers</span>
            <ExternalLinkIcon
              className={classnames(styles.rightContent, styles.rightContentIcon)}
            />
          </ExternalLink>
          <div className="dropdown-divider" />
          <div className="dropdown-header">{weekText}</div>
          <ExternalLink
            {...itemProps}
            href={`https://nus.edu.sg/registrar/docs/info/calendar/ay20${baseYearNumber}-20${
              baseYearNumber + 1
            }.pdf`}
          >
            <Calendar className={styles.leftIcon} />
            <span className={styles.title}>Academic Calendar</span>
            <ExternalLinkIcon
              className={classnames(styles.rightContent, styles.rightContentIcon)}
            />
          </ExternalLink>
        </div>
      </div>
    );
  };

  return <Downshift>{renderDropdown}</Downshift>;
};

export default NavDropdown;
