import Loadable from 'react-loadable';
import { Props } from './EventMapInline';

export default Loadable<Props, any>({
  loader: () => import(/* webpackChunkName: "venue" */ './EventMapInline'),
  loading: () => null,
});
