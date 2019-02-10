import { Tracker } from './views';

interface Window {
  // Injected by Disqus
  DISQUS?: any;
  DISQUSWIDGETS?: any;

  disqus_config?: () => void;
  disqus_shortname?: string;

  // Injected by Matomo
  Piwik: { getTracker(): Tracker };

  // For the Redux developer extension
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
}
