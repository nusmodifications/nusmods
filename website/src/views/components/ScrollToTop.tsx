import React, { useEffect } from 'react';
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

  const location = useLocation();
  useEffect(() => {
    if (onPathChange) {
      scrollToTop();
    }
  }, [onPathChange, location.pathname, location.hash]);

  return null;
};

export default ScrollToTop;
