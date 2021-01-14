// Globals injected by Webpack DefinePlugin
/* eslint-disable no-underscore-dangle */
/**
 * NUSMods deployment environment.
 *
 * **Note:** although these environments may share the same name as
 * `NODE_ENV` and other envs, there are subtle differences. Definitions:
 *
 * - `production`: a production deployment of NUSMods, i.e. a deployment meant to
 *   be used by the general public.
 * - `staging`: a deployment of NUSMods's main development branch, which is
 *   not meant to be used by the general public but which may be promoted to
 *   production at any point.
 * - `preview`: a deployment of work-in-progress branches, e.g. PR deploy
 *   previews.
 * - `test`: we are in a test environment, e.g. a jest test run.
 * - `development`: all other situations.
 */
declare const NUSMODS_ENV: 'development' | 'production' | 'staging' | 'preview' | 'test';

declare const DATA_API_BASE_URL: string | undefined;
declare const VERSION_STR: string | undefined;
declare const DISPLAY_COMMIT_HASH: string | undefined;
declare const DEBUG_SERVICE_WORKER: boolean;
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
