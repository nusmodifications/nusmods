// @flow
import config from 'config';

window.addEventListener('load', () => {
  Promise.all([
    import(/* webpackChunkName: "autotrack" */ 'autotrack/lib/plugins/event-tracker'),
    import(/* webpackChunkName: "autotrack" */ 'autotrack/lib/plugins/outbound-link-tracker'),
    import(/* webpackChunkName: "autotrack" */ 'autotrack/lib/plugins/url-change-tracker'),
  ])
    .then(() => {
      window.ga('create', config.googleAnalyticsId, 'auto');

      window.ga('require', 'eventTracker');
      window.ga('require', 'outboundLinkTracker');
      window.ga('require', 'urlChangeTracker');

      window.ga('send', 'pageview');
    });
});
