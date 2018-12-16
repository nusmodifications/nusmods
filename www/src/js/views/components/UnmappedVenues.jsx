// @flow
import type { VenueList } from 'types/venues';
import type { State } from 'reducers';

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import venueLocations from 'data/venues.json';
// import styles from './UnmappedVenues.scss';

type Props = {
  venueList: VenueList,
};

class UnmappedVenues extends PureComponent<Props> {
  render() {
    const percentageMapped = (_.size(venueLocations) / this.props.venueList.length) * 100;
      (Object.keys(venueLocations).length / this.props.venueList.length) * 100;
    const percentageMappedStr = percentageMapped.toFixed().toString();

    return (
      <div>
        <div className="progress">
          {/* <div className={styles.progressBar}> */}
          <div
            className="progress-bar progress-bar-striped progress-bar-animated bg-success"
            role="progressbar"
            style={{ width: `${percentageMappedStr}%` }}
            aria-valuenow={percentageMappedStr}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {percentageMappedStr}%
          </div>
          {/* </div> */}
        </div>
        <br />
        <p>
          {percentageMappedStr}% of venues are mapped! Help us locate the remaining venues. All you
          have to do is choose a venue and mark where it is on the map. If you&apos;re at the venue,
          you can also use your phone&apos;s GPS to get the location automatically.
        </p>
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
