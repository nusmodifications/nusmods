import Loadable from 'react-loadable';
import { retryImport } from 'utils/error';

const VenueMap = Loadable({
  loader: () => retryImport(() => import(/* webpackChunkName: "venue" */ './VenueMap')),
  loading() {
    return null;
  },
});

export default VenueMap;
