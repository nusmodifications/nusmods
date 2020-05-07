import * as React from 'react';
import classnames from 'classnames';
import { groupBy, toPairs, sortBy } from 'lodash';
import { Link, LinkProps } from 'react-router-dom';

import { Venue } from 'types/venues';
import { venuePage } from 'views/routes/paths';

import styles from './VenueList.scss';

type Props = {
  venues: Venue[];
  selectedVenue?: Venue | null;
  linkProps?: Omit<LinkProps, 'to'>;
};

export default function VenueList(props: Props) {
  const venueList = groupBy(props.venues, (venue) => venue.charAt(0).toUpperCase());
  const sortedVenueList = sortBy(toPairs(venueList), ([key]) => key);

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
                  {venue}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
