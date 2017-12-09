// @flow
import React from 'react';
import { map } from 'lodash';
import VenueDetailRow from 'views/venues/VenueDetailRow';

import type { VenueInfo } from 'types/venues';
import type { Venue } from 'types/modules';

import styles from './VenueList.scss';

type Props = {
  venues: VenueInfo,
  expandedVenue: Venue,
  onSelect: (Venue, string) => void; // Called with venue name and venue URL (/venues/<venue>)
};

export default function VenueList(props: Props) {
  const lowercaseExpandedVenue = props.expandedVenue.toLowerCase();
  return (
    <ul className={styles.venueList}>
      {map(props.venues, (availability, name) => (
        <VenueDetailRow
          key={name}
          name={name}
          availability={availability}
          expanded={name.toLowerCase() === lowercaseExpandedVenue}
          onClick={props.onSelect}
        />
      ))}
    </ul>
  );
}
