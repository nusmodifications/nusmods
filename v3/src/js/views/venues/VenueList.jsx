// @flow
import React from 'react';
import VenueDetailRow from 'views/venues/VenueDetailRow';
import Warning from 'views/errors/Warning';

import type { VenueInfo } from 'types/venues';
import type { Venue } from 'types/modules';

import styles from './VenueList.scss';

type Props = {
  venues: VenueInfo,
  expandedVenue: Venue,
  onSelect: (Venue, string, HTMLElement) => void; // Called with venue name and venue URL (/venues/<venue>)
};

export default function VenueList(props: Props) {
  const rowRefs: { [Venue]: HTMLElement } = {};
  const { venues, expandedVenue, onSelect } = props;
  const lowercaseExpandedVenue = expandedVenue.toLowerCase();

  // Case-insensitive, natural sort of venue names
  const sortedVenueNames = Object.keys(venues).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase(), 'en', { numeric: true }));

  let venueRows = sortedVenueNames.map(name => (
    <VenueDetailRow
      key={name}
      name={name}
      availability={venues[name]}
      expanded={name.toLowerCase() === lowercaseExpandedVenue}
      rootElementRef={(row) => {
        if (row) {
          rowRefs[name] = row;
        }
      }}
      onClick={(selectedVenue, venueURL) => onSelect(selectedVenue, venueURL, rowRefs[name])}
    />
  ));

  if (venueRows.length === 0) {
    venueRows = <Warning message="No matching venues found" />;
  }

  return (
    <ul className={styles.venueList}> {venueRows} </ul>
  );
}
