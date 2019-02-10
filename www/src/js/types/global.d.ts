declare module '*.scss' {
  const content: { [className: string]: string };
  export = content;
}

declare module '*.svg' {
  const content: React.ComponentType<React.SVGAttributes<SVGElement>>;
  export = content;
}
