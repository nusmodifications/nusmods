import _ from 'lodash';

import type { ViewportOptions } from './types';

type SizeSource = {
  height?: unknown;
  pixelRatio?: unknown;
  width?: unknown;
};

export function parseViewportOptions(source: SizeSource): ViewportOptions {
  let options: ViewportOptions = {
    pixelRatio: _.clamp(Number(source.pixelRatio) || 1, 1, 3),
  };

  const height = Number(source.height);
  const width = Number(source.width);

  if (
    typeof source.height !== 'undefined' &&
    typeof source.width !== 'undefined' &&
    !Number.isNaN(height) &&
    !Number.isNaN(width) &&
    height > 0 &&
    width > 0
  ) {
    options = { ...options, height, width };
  }

  return options;
}
