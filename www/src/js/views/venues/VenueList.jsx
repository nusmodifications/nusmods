// @flow
import React from 'react';
import classnames from 'classnames';
import { map, groupBy } from 'lodash';

import type { OnSelectVenue } from 'types/views';
import type { Venue, VenueDetailList } from 'types/venues';

import styles from './VenueList.scss';

type Props = {
  venues: VenueDetailList,
  selectedVenue: ?Venue,
  onSelect: OnSelectVenue, // Called with venue name and venue URL (/venues/<venue>)
};

export default function VenueList(props: Props) {
  // Case-insensitive, natural sort of venue names
  const venueListPages = groupBy(props.venues, ([venue]) => venue.charAt(0).toUpperCase());

  return (
    <ul className={styles.venueList}>
      {map(venueListPages, (venues, heading) => (
        <li key={heading}>
          <h3 className={styles.heading}>{heading}</h3>

          <ul className={styles.subList}>
            {venues.map(([venue]) => (
              <li key={venue}>
                <button
                  type="button"
                  className={classnames('btn btn-link', {
                    [styles.selected]: venue === props.selectedVenue,
                  })}
                  onClick={() => props.onSelect(venue)}
                >
                  {venue}
                </button>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
