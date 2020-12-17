import type { FC } from 'react';
import useScrollToTop from 'views/hooks/useScrollToTop';

/**
 * @deprecated Use `useScrollToTop` instead
 */
const ScrollToTop: FC = () => {
  useScrollToTop();
  return null;
};

export default ScrollToTop;
