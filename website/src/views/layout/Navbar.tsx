import type { FC } from 'react';
import { NavLink } from 'react-router-dom';

import ErrorBoundary from 'views/errors/ErrorBoundary';
import Logo from 'img/nusmods-logo.svg';

import GlobalSearchContainer from './GlobalSearchContainer';
import NavDropdown from './NavDropdown';
import Navtabs from './Navtabs';

import styles from './Navbar.scss';

const Navbar: FC = () => (
  <header className={styles.navbarWrapper}>
    <div className={styles.navLeft}>
      <NavLink to="/" title="Home">
        <Logo className={styles.brandLogo} title="NUSMods" />
      </NavLink>
    </div>
    <div className={styles.navCenter}>
      <Navtabs />
    </div>
    <div className={styles.navRight}>
      <ErrorBoundary>
        <GlobalSearchContainer />
      </ErrorBoundary>
      <NavDropdown />
    </div>
  </header>
);

export default Navbar;
