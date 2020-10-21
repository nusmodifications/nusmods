import React, { useEffect } from 'react';
import { scrollToHash } from 'utils/react';

function scrollToTop() {
  window.scrollTo(0, 0);
}

export type Props = {
  onComponentDidMount?: boolean;
  shouldScrollToHash?: boolean;
};

const ScrollToTop: React.FC<Props> = ({
  onComponentDidMount = false,
  shouldScrollToHash = true,
}) => {
  useEffect(() => {
    // FIXME:  This effect runs on mount AND when any of those props change.
    if (onComponentDidMount && !window.location.hash) {
      scrollToTop();
    } else if (shouldScrollToHash) {
      scrollToHash();
    }
  }, [onComponentDidMount, shouldScrollToHash]);

  return null;
};

export default ScrollToTop;
