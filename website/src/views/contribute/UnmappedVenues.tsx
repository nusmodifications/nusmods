import { PureComponent } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { partition } from 'lodash';

import { VenueList as Venues, VenueLocationMap } from 'types/venues';

import LoadingSpinner from 'views/components/LoadingSpinner';
import VenueList from 'views/venues/VenueList';
import { State as StoreState } from 'types/state';
import styles from './UnmappedVenues.scss';
import withVenueLocations from '../components/map/withVenueLocations';

type Props = {
  venueList: Venues;
  venueLocations: VenueLocationMap;
};

type State = {
  readonly expanded: boolean;
};

export class UnmappedVenuesComponent extends PureComponent<Props, State> {
  override state = {
    expanded: false,
  };

  override render() {
    const { venueList, venueLocations } = this.props;
    const { expanded } = this.state;

    const [mappedVenues, unmappedVenues] = partition(
      venueList,
      (venue) => venueLocations[venue] && venueLocations[venue]?.location,
    );
    const percentMapped = (mappedVenues.length / venueList.length) * 100;
    const percentText = `${percentMapped.toFixed(1)}%`;

    return (
      <div>
        {this.props.venueList ? (
          <div className={styles.wrapper}>
            <div>
              <div className={classnames(styles.progress, 'progress')}>
                <div
                  className={classnames('progress-bar progress-bar-striped bg-success')}
                  role="progressbar"
                  style={{ width: `${percentMapped}%` }}
                  aria-valuenow={percentMapped}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  {percentText}
                </div>
              </div>
              <p>
                <strong>
                  {percentText} ({mappedVenues.length}/{venueList.length})
                </strong>{' '}
                of all class venues are mapped!
              </p>
              <p>
                All you have to do is choose a venue and mark where it is on the map. If you&apos;re
                at that venue already, you can also use your phone GPS to use your current location.
              </p>
            </div>

            <div
              className={classnames({
                [styles.hidden!]: !expanded,
              })}
            >
              <VenueList venues={unmappedVenues} linkProps={{ target: '_blank' }} />
            </div>
            {!expanded && (
              <p className={styles.showMore}>
                <button
                  className="btn btn-outline-primary"
                  type="button"
                  onClick={() => this.setState({ expanded: true })}
                >
                  Show More
                </button>
              </p>
            )}
          </div>
        ) : (
          <LoadingSpinner />
        )}
      </div>
    );
  }
}

const ConnectedUnmappedVenue = connect((state: StoreState) => ({
  venueList: state.venueBank.venueList,
}))(UnmappedVenuesComponent);

/**
 * Use Loadable.map to load the venue location data
 */
const UnmappedVenues = withVenueLocations(() => Promise.resolve(ConnectedUnmappedVenue));
export default UnmappedVenues;
