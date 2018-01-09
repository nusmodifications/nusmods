// @flow
import React from 'react';
import VenueDetailRow from 'views/venues/VenueDetailRow';

import type { Venue, VenueInfo } from 'types/venues';

import styles from './VenueList.scss';

type Props = {
  venues: VenueInfo,
  expandedVenue: Venue,
  onSelect: (Venue, string, HTMLElement) => void, // Called with venue name and venue URL (/venues/<venue>)
};

const stringCompare =
  // Feature detect Intl API
  window.Intl && typeof window.Intl === 'object'
    ? // $FlowFixMe: Flow doesn't have Intl typedefs https://github.com/facebook/flow/issues/1270
      new Intl.Collator('en', { sensitivity: 'base', numeric: true }).compare
    : (a, b) => a.localeCompare(b);

export default function VenueList(props: Props) {
  const rowRefs: { [Venue]: HTMLElement } = {};
  const { venues, expandedVenue, onSelect } = props;
  const lowercaseExpandedVenue = expandedVenue.toLowerCase();

  // Case-insensitive, natural sort of venue names
  const sortedVenueNames = Object.keys(venues).sort(stringCompare);

  return (
    <ul className={styles.venueList}>
      {sortedVenueNames.map((name) => (
        <VenueDetailRow
          key={name}
          name={name}
          availability={venues[name]}
          expanded={name.toLowerCase() === lowercaseExpandedVenue}
          rootElementRef={(row) => {
            if (row) rowRefs[name] = row;
          }}
          onClick={(selectedVenue, venueURL) => onSelect(selectedVenue, venueURL, rowRefs[name])}
        />
      ))}
    </ul>
  );
}
