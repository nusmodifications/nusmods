import type { FC } from 'react';
import useScrollToTopEffect from 'views/hooks/useScrollToTopEffect';

/**
 * @deprecated Use `useScrollToTopEffect` instead
 */
const ScrollToTop: FC = () => {
  useScrollToTopEffect();
  return null;
};

export default ScrollToTop;
