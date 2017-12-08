// @flow
import React from 'react';
import { withRouter } from 'react-router-dom';
import { map } from 'lodash';
import VenueDetailRow from 'views/venues/VenueDetailRow';

import type { ContextRouter } from 'react-router-dom';
import type { VenueInfo } from 'types/venues';
import type { Venue } from 'types/modules';

type Props = ContextRouter & {
  venues: VenueInfo,
  initialExpandedVenue: Venue,
  expandedVenue: Venue,
  onSelect: (Venue) => void;
};

function VenueList(props: Props) {
  const lowercaseExpandedVenue = props.expandedVenue.toLowerCase();
  return (
    <div>
      {map(props.venues, (availability, name) => (
        <VenueDetailRow
          key={name}
          name={name}
          availability={availability}
          expanded={name.toLowerCase() === lowercaseExpandedVenue}
          onClick={() => props.onSelect(name)}
        />
      ))}
    </div>
  );
}

export default withRouter(VenueList);
