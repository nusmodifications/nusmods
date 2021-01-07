// Globals injected by Webpack DefinePlugin
/* eslint-disable no-underscore-dangle */
declare const __DEV__: boolean;
declare const __TEST__: boolean;
declare const DATA_API_BASE_URL: string | undefined;
declare const VERSION_STR: string | undefined;
declare const DISPLAY_COMMIT_HASH: string | undefined;
declare const DEBUG_SERVICE_WORKER: boolean;
declare const VERCEL_ENV: string;
declare const VERCEL_GIT_COMMIT_REF: string;
/* eslint-enable no-underscore-dangle */

/**
 * The declarations below let us use Webpack loaders to load non-JS files
 */

declare module '*.scss' {
  const content: { [className: string]: string };
  export = content;
}

declare module '*.svg' {
  // SVG files are loaded as React components
  type SVGProps = React.SVGAttributes<SVGElement> & {
    // Added by SVGR
    title?: string;
  };

  const content: React.ComponentType<SVGProps>;

  export = content;
}

declare module '*.svg?url' {
  const content: string;
  export = content;
}

declare module '*.png' {
  const content: string;
  export = content;
}

declare module '*.jpeg' {
  const content: string;
  export = content;
}

declare module '*.jpg' {
  const content: string;
  export = content;
}

declare module '*.gif' {
  const content: string;
  export = content;
}
