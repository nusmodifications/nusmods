// @flow

import Loadable from 'react-loadable';
import { retryImport } from 'utils/error';
import type { Props } from './EventMap';

export default Loadable<Props, *>({
  loader: () => retryImport(() => import(/* webpackChunkName: "venue" */ './EventMap')),
  loading: () => null,
});
