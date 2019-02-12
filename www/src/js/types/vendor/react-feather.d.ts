declare module 'react-feather/dist/icons/*' {
  import * as React from 'react';

  interface Props extends React.SVGAttributes<SVGElement> {
    color?: string;
    size?: string | number;
  }

  const component: React.ComponentType<FeatherProps>;
  export = component;
}
