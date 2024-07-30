import * as React from 'react';
import classnames from 'classnames';
import { groupBy, toPairs, sortBy } from 'lodash';
import { Link, LinkProps } from 'react-router-dom';

import { Venue, VenueLocationMap } from 'types/venues';
import { venuePage } from 'views/routes/paths';

import { highlight } from 'utils/react';
import { tokenize } from 'utils/moduleSearch';
import styles from './VenueList.scss';

type Props = {
  venues: Venue[];
  venueLocations?: VenueLocationMap;
  selectedVenue?: Venue | null;
  linkProps?: Omit<LinkProps, 'to'>;
  query?: string;
};

const VenueList: React.FC<Props> = (props) => {
  // Added during the horrible COVID-19 times to hide E-Learning venues
  const physicalVenues = props.venues.filter((venue) => !venue.startsWith('E-Learn'));
  const venueList = groupBy(physicalVenues, (venue) => venue.charAt(0).toUpperCase());
  const sortedVenueList = sortBy(toPairs(venueList), ([key]) => key);

  const tokens = props.query ? tokenize(props.query.toLowerCase()) : [];

  return (
    <ul className={styles.venueList}>
      {sortedVenueList.map(([heading, venues]) => (
        <li key={heading}>
          <h3 className={styles.heading}>{heading}</h3>

          <ul className={styles.subList}>
            {venues.map((venue) => (
              <li key={venue}>
                <Link
                  to={{
                    pathname: venuePage(venue),
                    search: window.location.search,
                  }}
                  className={classnames(
                    'btn',
                    venue === props.selectedVenue ? 'btn-primary' : 'btn-outline-primary',
                  )}
                  {...props.linkProps}
                >
                  <div>{highlight(venue, tokens)}</div>
                  {props.venueLocations && props.venueLocations[venue] ? (
                    <div
                      className={classnames(
                        'font-weight-light d-inline-block text-truncate',
                        styles.subtitle,
                      )}
                    >
                      <span>{highlight(`${props.venueLocations[venue].roomName}`, tokens)}</span>
                    </div>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
};

export default VenueList;
