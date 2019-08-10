import bowser from 'bowser';

import { parseFloat } from 'types/utils';

/* eslint-disable import/prefer-default-export */

export const isBrowserSupported =
  bowser.check(
    {
      msedge: '14',
      chrome: '56',
      firefox: '52',
      safari: '10',
    },
    true,
  ) ||
  (bowser.ios && parseFloat(bowser.osversion));
