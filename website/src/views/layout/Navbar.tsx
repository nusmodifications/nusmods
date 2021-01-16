/* eslint-disable arrow-body-style */
import { FC, useCallback, useState } from 'react';
import { NavLink } from 'react-router-dom';

import ErrorBoundary from 'views/errors/ErrorBoundary';
import Logo from 'img/nusmods-logo.svg';

import GlobalSearchContainer from './GlobalSearchContainer';

import styles from './Navbar.scss';
import Navtabs from './Navtabs';

const Navbar: FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const handleSearchOpen = useCallback(() => setIsSearchOpen(true), []);
  const handleSearchClose = useCallback(() => setIsSearchOpen(false), []);
  return (
    <div className={styles.navbarWrapper}>
      {/* Bottom bar must be above the top bar in HTML, so that top bar can be interacted with. */}
      <nav className={styles.topBar}>
        <div className={styles.navLeft}>
          <NavLogo />
        </div>
        <div className={styles.navRight}>
          <ErrorBoundary>
            <GlobalSearchContainer
              isOpen={isSearchOpen}
              open={handleSearchOpen}
              close={handleSearchClose}
            />
          </ErrorBoundary>
          {!isSearchOpen && <button>lol</button>}
        </div>
      </nav>
      <div className={styles.bottomBar}>
        <Navtabs />
      </div>
    </div>
  );
};

export default Navbar;

const NavLogo: FC = () => {
  return (
    <NavLink className={styles.brand} to="/" title="Home">
      <Logo className={styles.brandLogo} title="NUSMods" />
    </NavLink>
  );
};
