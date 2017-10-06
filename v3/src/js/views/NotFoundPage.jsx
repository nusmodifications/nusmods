// @flow
import React from 'react';
import Helmet from 'react-helmet';
import Raven from 'raven-js';

import config from 'config';

export default function NotFoundPage() {
  Raven.captureMessage('404 - Page Not Found');
  const eventId = Raven.lastEventId();

  return (
    <div>
      <Helmet>
        <title>404 Not Found - {config.brandName}</title>
      </Helmet>

      <h1>404 Not Found</h1>
      <p>
        Were you expecting something here?
        <button className="btn btn-link" onClick={() => Raven.showReportDialog({ eventId })}>
        Tell us
        </button>
      </p>
    </div>
  );
}
