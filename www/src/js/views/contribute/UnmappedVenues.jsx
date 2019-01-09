// @flow
import type { VenueList as Venues } from 'types/venues';
import type { State } from 'reducers';

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { has, size, partition } from 'lodash';

import LoadingSpinner from 'views/components/LoadingSpinner';
import VenueList from 'views/venues/VenueList';
import venueLocations from 'data/venues.json';
import styles from './UnmappedVenues.scss';

type Props = {
  venueList: Venues,
};

class UnmappedVenues extends PureComponent<Props> {
  render() {
    const { venueList } = this.props;
    const [mappedVenues, unmappedVenues] = partition(venueList, (venue) =>
      has(venueLocations, venue),
    );
    const percentageMapped = String(((mappedVenues.length / venueList.length) * 100).toFixed());

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
                {percentageMapped}% of venues are mapped! Help us locate the remaining venues - all
                you have to do is choose a venue and mark where it is on the map. If you&apos;re at
                that exact venue, you can also use your phone GPS to use your current location.
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

export default connect(
  (state: State) => ({
    venueList: state.venueBank.venueList,
  }),
  null,
)(UnmappedVenues);
