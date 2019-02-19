import * as React from 'react';
import Loadable, { LoadingComponentProps } from 'react-loadable';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { partition } from 'lodash';

import { VenueList as Venues, VenueLocationMap } from 'types/venues';
import { State as StoreState } from 'reducers';

import LoadingSpinner from 'views/components/LoadingSpinner';
import VenueList from 'views/venues/VenueList';
import ApiError from 'views/errors/ApiError';
import styles from './UnmappedVenues.scss';

type Props = {
  venueList: Venues;
  venueLocations: VenueLocationMap;
};

type State = {
  readonly expanded: boolean;
};

export class UnmappedVenuesComponent extends React.PureComponent<Props, State> {
  state = {
    expanded: false,
  };

  render() {
    const { venueList, venueLocations } = this.props;
    const { expanded } = this.state;

    const [mappedVenues, unmappedVenues] = partition(
      venueList,
      (venue) => venueLocations[venue] && venueLocations[venue].location,
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
                [styles.hidden]: !expanded,
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

export const AsyncUnmappedVenues = Loadable.Map({
  loader: {
    venueLocations: () => import(/* webpackChunkName: "venue" */ 'data/venues.json'),
  },
  loading: (props: LoadingComponentProps) => {
    if (props.error) {
      return <ApiError dataName="venue locations" retry={props.retry} />;
    }

    if (props.pastDelay) {
      return <LoadingSpinner />;
    }

    return null;
  },
  render(loaded, props) {
    return <ConnectedUnmappedVenue venueLocations={loaded.venueLocations.default} {...props} />;
  },
});

export default AsyncUnmappedVenues;
