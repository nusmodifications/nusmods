import { useEffect, useRef } from 'react';
import type { LocationKey } from 'history';
import { useLocation } from 'react-router-dom';
import { scrollToHash } from 'utils/react';

function scrollToTop() {
  window.scrollTo(0, 0);
}

export type Props = {
  onComponentDidMount?: boolean;
  onPathChange?: boolean;
  shouldScrollToHash?: boolean;
};

const ScrollToTop: React.FC<Props> = ({
  onComponentDidMount = false,
  onPathChange = false,
  shouldScrollToHash = true,
}) => {
  useEffect(
    () => {
      if (onComponentDidMount && !window.location.hash) {
        scrollToTop();
      } else if (shouldScrollToHash) {
        scrollToHash();
      }
    },
    // This effect should only be run on component mount; don't care if props
    // change afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const previousLocationKey = useRef<LocationKey | null>(null);
  const location = useLocation();
  useEffect(() => {
    if (
      onPathChange &&
      // Don't scroll to top on initial mount (i.e. when previousLocationKey.current is null)
      previousLocationKey.current &&
      // Don't scroll to top if no navigation has happened
      previousLocationKey.current !== location.pathname
    ) {
      scrollToTop();
    }
    previousLocationKey.current = location.pathname;
  }, [onPathChange, location.pathname]);

  return null;
};

export default ScrollToTop;
