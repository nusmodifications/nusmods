// @flow
import type { VenueList } from 'types/venues';
import type { State } from 'reducers';

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { map, groupBy, size } from 'lodash';

import Loader from 'views/components/LoadingSpinner';

import venueLocations from 'data/venues.json';
import styles from './UnmappedVenues.scss';

type Props = {
  venueList: VenueList,
};

class UnmappedVenues extends PureComponent<Props> {
  renderUnmappedVenueList() {
    const unmappedVenueList = this.props.venueList
      .filter((venue) => !(venue in venueLocations))
      .sort()
      .slice(1);
    const unmappedVenueListPages = groupBy(unmappedVenueList, (venue) =>
      venue.charAt(0).toUpperCase(),
    );

    return (
      <div>
        <p>Here are the remaining unmapped venues:</p>

        <ul className={styles.venueList}>
          {map(unmappedVenueListPages, (venues, heading) => (
            <li key={heading}>
              <h3 className={styles.heading}>{heading}</h3>
              <ul className={styles.subList}>
                {venues.map((venue) => (
                  <li key={venue}>{venue}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  renderProgressBar() {
    const percentageMapped = (size(venueLocations) / this.props.venueList.length) * 100;
    const percentageMappedStr = percentageMapped.toFixed().toString();

    return (
      <div>
        <div className="progress" style={{ height: '20px' }}>
          <div
            className="progress-bar progress-bar-striped bg-success"
            role="progressbar"
            style={{ width: `${percentageMappedStr}%`, height: '20px' }}
            aria-valuenow={percentageMappedStr}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {percentageMappedStr}%
          </div>
        </div>
        <br />
        <p>
          {percentageMappedStr}% of venues are mapped! Help us locate the remaining venues{' '}
          <a href="/venues">here</a>. All you have to do is choose a venue and mark where it is on
          the map. If you&apos;re at that exact venue, you can also use your phone GPS to use your
          current location.
        </p>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.props.venueList ? (
          <div>
            {this.renderProgressBar()}
            {this.renderUnmappedVenueList()}
          </div>
        ) : (
          <Loader />
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
