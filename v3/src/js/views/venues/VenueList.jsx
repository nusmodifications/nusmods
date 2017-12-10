// @flow
import React from 'react';
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
  const { venues, expandedVenue, onSelect } = props;
  const lowercaseExpandedVenue = expandedVenue.toLowerCase();

  // Case-insensitive, natural sort of venue names
  const sortedVenueNames = Object.keys(venues).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase(), 'en', { numeric: true }));

  return (
    <ul className={styles.venueList}>
      {sortedVenueNames.map(name => (
        <VenueDetailRow
          key={name}
          name={name}
          availability={venues[name]}
          expanded={name.toLowerCase() === lowercaseExpandedVenue}
          onClick={onSelect}
        />
      ))}
    </ul>
  );
}
