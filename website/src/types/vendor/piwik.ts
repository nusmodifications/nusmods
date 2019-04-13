// Full list: https://developer.matomo.org/api-reference/tracking-javascript
export type Tracker = {
  /**
   * Using the Tracker Object
   */
  // Logs an event with an event category (Videos, Music, Games...),
  // an event action (Play, Pause, Duration, Add Playlist, Downloaded, Clicked...),
  // and an optional event name and optional numeric value.
  trackEvent: (category: string, action: string, name?: string, value?: number) => void;

  // Logs a visit to this page
  trackPageView: (pageTitle?: string) => void;

  // Log an internal site search for a specific keyword, in an optional category,
  // specifying the optional count of search results in the page.
  trackSiteSearch: (keyword: string, category?: string, resultsCount?: number) => void;

  // Manually log a conversion for the numeric goal ID, with an optional numeric
  // custom revenue customRevenue.
  trackGoal: (idGoal: string, customRevenue?: number) => void;

  // Manually log a click from your own code. url is the full URL which is to be
  // tracked as a click. linkType can either be 'link' for an outlink or 'download' for a download.
  trackLink: (url: string, linkType: 'link' | 'download') => void;

  trackAllContentImpressions: () => void;
  trackVisibleContentImpressions: (checkOnScroll: boolean, timeIntervalInMs: number) => void;

  // Scans the given DOM node and its children for content blocks and tracks an
  // impression for them if no impression was already tracked for it.
  trackContentImpressionsWithinNode: (domNode: Element) => void;

  enableHeartBeatTimer: (delayInSeconds: number) => void;
  enableCrossDomainLinking: () => void;
  setCrossDomainLinkingTimeout: (timeout: number) => void;

  setCustomDimension: (
    customDimensionId: number,
    customDimensionValue: string | number | boolean,
  ) => void;

  /**
   * Managing Consent
   */
  // By default the Matomo tracker assumes consent to tracking. To change this behavior
  // so nothing is tracked until a user consents, you must call requireConsent.
  requireConsent: () => void;

  // Marks that the current user has consented. The consent is one-time only, so in a
  // subsequent browser session, the user will have to consent again. To remember consent,
  // see the method below: rememberConsentGiven.
  setConsentGiven: () => void;

  // Marks that the current user has consented, and remembers this consent through a
  // browser cookie. The next time the user visits the site, Matomo will remember that
  // they consented, and track them. If you call this method, you do not need to
  // call setConsentGiven.
  rememberConsentGiven: (hoursToExpire: number) => void;

  // Removes a user's consent, both if the consent was one-time only and if the consent was
  // remembered. After calling this method, the user will have to consent again in order to be tracked.
  forgetConsentGiven: () => void;

  // Opt user out of tracker using cookie
  optUserOut: () => void;

  forgetUserOptOut: () => void;

  // Check for user opt out status
  isUserOptedOut: () => boolean;
};
