// @flow

import Loadable from 'react-loadable';
import type { Props } from './EventMap';

export default Loadable<Props, *>({
  loader: () => import(/* webpackChunkName: "venue" */ './EventMap'),
  loading: () => null,
});
