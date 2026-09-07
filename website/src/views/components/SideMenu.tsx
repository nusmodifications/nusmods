import { FC, memo, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X as Close } from 'react-feather';
import { Button } from 'components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from 'components/ui/sheet';
import useMediaQuery from 'views/hooks/useMediaQuery';
import { breakpointUp } from 'utils/css';

import styles from './SideMenu.scss';

type Props = {
  children: React.ReactNode;
  openIcon?: React.ReactNode;
  closeIcon?: React.ReactNode;
  isOpen: boolean;
  toggleMenu: (boolean: boolean) => void;
};

export const OPEN_MENU_LABEL = 'Open menu';
export const CLOSE_MENU_LABEL = 'Close menu';

const DEFAULT_OPEN_ICON = <Menu aria-label={OPEN_MENU_LABEL} />;
const DEFAULT_CLOSE_ICON = <Close aria-label={CLOSE_MENU_LABEL} />;

export const SideMenuComponent: FC<Props> = ({
  openIcon = DEFAULT_OPEN_ICON,
  closeIcon = DEFAULT_CLOSE_ICON,
  isOpen,
  toggleMenu,
  children,
}) => {
  const isDesktop = useMediaQuery(breakpointUp('md'));
  // Searchkit filters register on mount. Keep one portal destination, including
  // while the mobile sheet is closed, so changing its host never resets filters.
  const [content] = useState(() => document.createElement('div'));
  const attachContent = useCallback(
    (host: HTMLDivElement | null) => {
      if (host) host.appendChild(content);
    },
    [content],
  );

  return (
    <Sheet open={isOpen && !isDesktop} onOpenChange={toggleMenu}>
      <div className={styles.fab}>
        <SheetTrigger asChild>
          <Button size="icon" className="ui-fab" aria-label={OPEN_MENU_LABEL}>
            {openIcon}
          </Button>
        </SheetTrigger>
      </div>
      {isDesktop && (
        <div className={styles.boundaryContainer}>
          <div className={styles.sideMenu} ref={attachContent} />
        </div>
      )}
      <SheetContent className={styles.sheet} aria-describedby={undefined}>
        <SheetTitle className="sr-only">{OPEN_MENU_LABEL}</SheetTitle>
        <SheetClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className={styles.closeButton}
            aria-label={CLOSE_MENU_LABEL}
          >
            {closeIcon}
          </Button>
        </SheetClose>
        <div ref={attachContent} />
      </SheetContent>
      {createPortal(children, content)}
    </Sheet>
  );
};

export default memo(SideMenuComponent);
