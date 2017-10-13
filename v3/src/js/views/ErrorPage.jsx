// @flow
import type { Node } from 'react';

import React, { PureComponent } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import Raven from 'raven-js';

import config from 'config';

type Props = {
  children?: Node,
  error: string,
  eventId?: string,
  showRefresh: boolean,
};

export default class NotFoundPage extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    error: 'something went wrong',
    showRefresh: true,
  };

  render() {
    const { error, showRefresh, eventId } = this.props;

    return (
      <div>
        <Helmet>
          <title>Uh oh... - {config.brandName}</title>
        </Helmet>

        <div className="page-container">
          <div className="ml-md-5 mt-3">
            <p className="mb-0 h1 text-primary">Uh oh...</p>
            <h1 className="mb-4">{error}</h1>
            {showRefresh &&
            <p>
              <button
                className="btn-link p-0"
                onClick={() => window.location.reload(true)}
              >Refreshing the page</button> may help
            </p>}

            {eventId &&
            <p>
              An error report has been made and we will look into this.
              <button
                className="btn-link p-0"
                onClick={() => Raven.showReportDialog({ eventId })}
              >
                Tell us more about what happened so we can
              </button>
            </p>}
          </div>
        </div>
      </div>
    );
  }
}
