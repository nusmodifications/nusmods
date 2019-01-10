// @flow
import type { VenueList as Venues, VenueLocationMap } from 'types/venues';
import type { State } from 'reducers';

import React, { PureComponent } from 'react';
import Loadable, { type LoadingProps } from 'react-loadable';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { partition } from 'lodash';

import LoadingSpinner from 'views/components/LoadingSpinner';
import VenueList from 'views/venues/VenueList';
import ApiError from 'views/errors/ApiError';
import styles from './UnmappedVenues.scss';

type Props = {
  venueList: Venues,
  venueLocations: VenueLocationMap,
};

class UnmappedVenues extends PureComponent<Props> {
  render() {
    const { venueList, venueLocations } = this.props;
    const [mappedVenues, unmappedVenues] = partition(
      venueList,
      (venue) => venueLocations[venue] && venueLocations[venue].location,
    );
    const percentageMapped = ((mappedVenues.length / venueList.length) * 100).toFixed();

    return (
      <div>
        {this.props.venueList ? (
          <div className={styles.wrapper}>
            <div>
              <div className={classnames(styles.progress, 'progress')}>
                <div
                  className={classnames('progress-bar progress-bar-striped bg-success')}
                  role="progressbar"
                  style={{ width: `${percentageMapped}%` }}
                  aria-valuenow={percentageMapped}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {percentageMapped}%
                </div>
              </div>
              <p>
                <strong>
                  {percentageMapped}% ({mappedVenues.length}/{venueList.length})
                </strong>{' '}
                of all class venues are mapped!
              </p>
              <p>
                Help us locate the remaining venues so that NUS is easier to navigate—all you have
                to do is choose a venue and mark where it is on the map. If you&apos;re at that
                exact venue, you can also use your phone GPS to use your current location.
              </p>
            </div>

            <VenueList venues={unmappedVenues} selectedVenue={null} />
          </div>
        ) : (
          <LoadingSpinner />
        )}
      </div>
    );
  }
}

const AsyncUnmappedVenues = Loadable.Map({
  loader: {
    venueLocations: () => import(/* webpackChunkName: "venue" */ 'data/venues.json'),
  },
  loading: (props: LoadingProps) => {
    if (props.error) {
      return <ApiError dataName="venue locations" retry={props.retry} />;
    } else if (props.pastDelay) {
      return <LoadingSpinner />;
    }

    return null;
  },
  render(loaded, props) {
    return <UnmappedVenues venueLocations={loaded.venueLocations.default} {...props} />;
  },
});

export default connect((state: State) => ({
  venueList: state.venueBank.venueList,
}))(AsyncUnmappedVenues);
