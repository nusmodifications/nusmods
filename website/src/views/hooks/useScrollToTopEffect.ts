import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToHash } from 'utils/react';

function scrollToTop() {
  window.scrollTo(0, 0);
}

/**
 * Scrolls to top (or hash, if a hash is present in the URL) on the first
 * completed render.
 */
export default function useScrollToTopEffect() {
  // TODO: Prevent location changes from triggering renders, as we don't care.
  // We can't use window.location to support non-browser environments (e.g.
  // tests).
  const { hash } = useLocation();

  // Don't care if anything changes after the first render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => (hash ? scrollToHash(hash) : scrollToTop()), []);
}
