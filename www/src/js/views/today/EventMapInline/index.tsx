// @flow

import Loadable from 'react-loadable';
import type { Props } from './EventMapInline';

export default Loadable<Props, *>({
  loader: () => import(/* webpackChunkName: "venue" */ './EventMapInline'),
  loading: () => null,
});
