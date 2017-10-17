// @flow

import React, { PureComponent } from 'react';

type Props = {
  color?: string,
  size?: number | string,
}

export default class LinkedIn extends PureComponent<Props> {
  static defaultProps = {
    color: 'currentColor',
    size: 24,
  };

  render() {
    const { size, color } = this.props;

    /* eslint-disable max-len */
    // SVG from https://icons8.com/icon/set/linkedin/all
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" version="1.1" width={size} height={size} fill={color}>
        <g id="surface1">
          <path d="M 40 0 L 10 0 C 4.484375 0 0 4.484375 0 10 L 0 40 C 0 45.515625 4.484375 50 10 50 L 40 50 C 45.515625 50 50 45.515625 50 40 L 50 10 C 50 4.484375 45.515625 0 40 0 Z M 16 34.898438 L 16 42 L 8 42 L 8 19 L 16 19 Z M 12 16.5 C 9.601563 16.5 8 14.800781 8 12.699219 C 8 10.601563 9.601563 9 12 9 C 14.398438 9 15.898438 10.601563 16 12.699219 C 16 14.800781 14.5 16.5 12 16.5 Z M 42 42 L 34 42 C 34 42 34 29.898438 34 29 C 34 28.101563 33.898438 25 30.5 25 C 27.5 25 27 27.898438 27 29 C 27 30.101563 27 42 27 42 L 19 42 L 19 19 L 27 19 L 27 22.101563 C 27 22.101563 28.601563 19 33.300781 19 C 38.101563 19 42 22.300781 42 29 Z " />
        </g>
      </svg>
    );
  }
}
