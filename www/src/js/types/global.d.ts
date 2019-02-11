declare module '*.scss' {
  const content: { [className: string]: string };
  export = content;
}

declare module '*.svg' {
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
