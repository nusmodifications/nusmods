/* eslint-disable arrow-body-style */
import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import weekText from 'utils/weekText';
import ErrorBoundary from 'views/errors/ErrorBoundary';
import Logo from 'img/nusmods-logo.svg';

import GlobalSearchContainer from './GlobalSearchContainer';

import styles from './Navbar.scss';
import Navtabs from './Navtabs';

const Navbar: FC = ({ children }) => {
  return (
    <div className={styles.navbarWrapper}>
      {/* Bottom bar must be above the top bar in HTML, so that top bar can be interacted with. */}
      <nav className={styles.topBar}>
        <div className={styles.navLeft}>
          <NavLink className={styles.brand} to="/" title="Home">
            <Logo className={styles.brandLogo} title="NUSMods" />
          </NavLink>
          <ErrorBoundary>
            <GlobalSearchContainer />
          </ErrorBoundary>
        </div>
        <div className={styles.navRight}>
          <button>lol</button>
        </div>
      </nav>
      <div className={styles.bottomBar}>
        <Navtabs />
      </div>
    </div>
  );
};
// <div className={styles.weekText}>{weekText}</div>

export default Navbar;
