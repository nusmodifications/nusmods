// @flow
import config from 'config';

export default function initializeGA() {
  window.addEventListener('load', () => {
    import(/* webpackChunkName: "autotrack", webpackPreload: true */ 'autotrack/autotrack').then(() => {
      const origHandleUrlChange = window.gaplugins.UrlChangeTracker.prototype.handleUrlChange;
      // The following is a mega hack for using react-helmet together with autotrack...
      // This timeout is needed because React (and consequently React Helmet's) render
      // update is not synchronous. In fact, UrlChangeTracker.handleUrlChange is already
      // made async via setTimeout(..., 0) but it's still insufficient. A timeout of 100ms
      // delays the GA invocation sufficiently long enough for React to do its stuff.
      // 100ms is an arbitary value which works well enough for most cases.
      const HANDLE_URL_CHANGE_TIMEOUT = 100;
      // eslint-disable-next-line
      window.gaplugins.UrlChangeTracker.prototype.handleUrlChange = function(historyDidUpdate) {
        setTimeout(() => {
          origHandleUrlChange.call(this, historyDidUpdate);
        }, HANDLE_URL_CHANGE_TIMEOUT);
      };

      window.ga('create', config.googleAnalyticsId, 'auto');

      window.ga('require', 'eventTracker');
      window.ga('require', 'outboundLinkTracker');
      window.ga('require', 'urlChangeTracker');

      window.ga('send', 'pageview');
    });
  });
}
