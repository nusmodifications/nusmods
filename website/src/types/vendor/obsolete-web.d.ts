declare module 'obsolete-web' {
  interface ObsoleteOptions {
    template: string;
    position: 'beforeend' | 'afterbegin';
    promptOnNonTargetBrowser: boolean;
    promptOnUnknownBrowser: boolean;
  }

  declare class Obsolete {
    constructor(options?: Partial<ObsoleteOptions>) {
      // This empty function body exists to prevent ESLint from crashing due to
      // https://github.com/typescript-eslint/typescript-eslint/issues/420
    }

    test(browsers: string[], done?: () => void);
  }

  export default Obsolete;
}

namespace ObsoleteWeb {
  declare class Detective {
    detect(
      userAgent: string,
      targetBrowsers: string[],
      promptOnNonTargetBrowser: boolean,
      promptOnUnknownBrowser: boolean,
    ): boolean;
  }
}

declare module 'obsolete-web/esm/detective' {
  export default ObsoleteWeb.Detective;
}

declare module 'obsolete-web/cjs/detective' {
  export = ObsoleteWeb.Detective;
}
