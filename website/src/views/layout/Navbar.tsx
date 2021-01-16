/* eslint-disable arrow-body-style */
import { FC, useCallback, useState } from 'react';
import { NavLink } from 'react-router-dom';

import ErrorBoundary from 'views/errors/ErrorBoundary';
import Logo from 'img/nusmods-logo.svg';

import GlobalSearchContainer from './GlobalSearchContainer';

import styles from './Navbar.scss';
import Navtabs from './Navtabs';
import NavDropdown from './NavDropdown';

const Navbar: FC = () => {
  // FIXME: If search is open, if we narrow the viewport such that global seacrh
  // is disabled, isSearchOpen is stuck in `true`.
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const handleSearchOpen = useCallback(() => setIsSearchOpen(true), []);
  const handleSearchClose = useCallback(() => setIsSearchOpen(false), []);
  return (
    <header className={styles.navbarWrapper}>
      <div className={styles.navLeft}>
        <NavLogo />
      </div>
      <div className={styles.navCenter}>
        <Navtabs />
      </div>
      <div className={styles.navRight}>
        <ErrorBoundary>
          <GlobalSearchContainer
            isOpen={isSearchOpen}
            open={handleSearchOpen}
            close={handleSearchClose}
          />
        </ErrorBoundary>
        <NavDropdown />
      </div>
    </header>
  );
};

export default Navbar;

const NavLogo: FC = () => {
  return (
    <NavLink to="/" title="Home">
      <Logo className={styles.brandLogo} title="NUSMods" />
    </NavLink>
  );
};
