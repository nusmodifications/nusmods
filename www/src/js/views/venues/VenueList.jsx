// @flow
import React from 'react';
import classnames from 'classnames';
import { map, groupBy } from 'lodash';
import { Link } from 'react-router-dom';

import type { Venue, VenueDetailList } from 'types/venues';
import { venuePage } from 'views/routes/paths';

import styles from './VenueList.scss';

type Props = {
  venues: VenueDetailList,
  selectedVenue: ?Venue,
};

export default function VenueList(props: Props) {
  const venueListPages = groupBy(props.venues, ([venue]) => venue.charAt(0).toUpperCase());

  return (
    <ul className={styles.venueList}>
      {map(venueListPages, (venues, heading) => (
        <li key={heading}>
          <h3 className={styles.heading}>{heading}</h3>

          <ul className={styles.subList}>
            {venues.map(([venue]) => (
              <li key={venue}>
                <Link
                  to={{
                    pathname: venuePage(venue),
                    search: window.location.search,
                  }}
                  className={classnames('btn btn-link', {
                    [styles.selected]: venue === props.selectedVenue,
                  })}
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
