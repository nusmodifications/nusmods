/**
 * These declarations lets us use Webpack loaders to load non-JS files
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
