// @flow
import React, { PureComponent } from 'react';
import { map } from 'lodash';
import VenueDetailRow from 'views/venues/VenueDetailRow';

import type { VenueInfo } from 'types/venues';
import type { Venue } from 'types/modules';

type Props = {
  venues: VenueInfo,
};

type State = {
  expandedVenue: Venue;
};

export default class VenueList extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      expandedVenue: '',
    };
  }

  render() {
    return (
      <div>
        {map(this.props.venues, (availability, name) => (
          <VenueDetailRow
            key={name}
            name={name}
            availability={availability}
            expanded={name === this.state.expandedVenue}
            onClick={() => this.setState({ expandedVenue: name })}
          />
        ))}
      </div>
    );
  }
}
