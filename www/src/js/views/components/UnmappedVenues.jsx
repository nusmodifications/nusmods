// @flow
import type { VenueList } from 'types/venues';
import type { State } from 'reducers';

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import Loader from 'views/components/LoadingSpinner';

import venueLocations from 'data/venues.json';
// import styles from './UnmappedVenues.scss';

type Props = {
  venueList: VenueList,
};

class UnmappedVenues extends PureComponent<Props> {
  renderProgressBar() {
    const percentageMapped = (_.size(venueLocations) / this.props.venueList.length) * 100;
    const percentageMappedStr = percentageMapped.toFixed().toString();
    return (
      <div>
        <div className="progress" style={{ height: '20px' }}>
          {/* <div className={styles.progressBar}> */}
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

  render() {
    return <div>{this.props.venueList ? this.renderProgressBar() : <Loader />}</div>;
  }
}

export default connect(
  (state: State) => ({
    venueList: state.venueBank.venueList,
  }),
  null,
)(UnmappedVenues);
