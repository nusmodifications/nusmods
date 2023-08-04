import { Tracker } from 'types/vendor/piwik';

export type DEBUG_HOOK_NAMES = 'SET_ERROR_REPORTING_DEBUG' | 'SET_COVID_ZONES';

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

    // Allows debugging
    [debugHooks: DEBUG_HOOK_NAMES]: (newValue: any) => void;
  }

  interface Navigator {
    // https://microsoft.github.io/PowerBI-JavaScript/interfaces/_node_modules_typedoc_node_modules_typescript_lib_lib_dom_d_.msfilesaver.html#mssaveoropenblob
    msSaveOrOpenBlob?: (blob: any, defaultName?: string) => boolean;
  }
}
