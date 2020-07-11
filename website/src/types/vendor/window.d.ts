import { Tracker } from 'types/vendor/piwik';

declare global {
  interface Window {
    // Add global objects to window namespace
    // See https://github.com/Microsoft/TypeScript/issues/19816
    Intl: Intl;

    parseFloat: typeof parseFloat;

    // Injected by Disqus
    DISQUS?: any;
    DISQUSWIDGETS?: any;

    disqus_config?: () => void;
    disqus_shortname?: string;

    // Injected by Matomo
    Piwik: { getTracker(url: string, id: string): Tracker };

    // For the Redux developer extension
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;

    // For enabling/disabling the submission button of the error reporting form
    SET_ERROR_REPORTING_DEBUG: any;
  }
}
