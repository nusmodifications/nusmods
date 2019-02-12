import * as React from 'react';

type VenueContextValue = {
  readonly toggleDetailScrollable: (boolean: boolean) => void;
};

const defaultValue: VenueContextValue = {
  // Sets scrollable-y on the .venueDetail container. Setting this to false
  // allows the content of the container to overflow the container
  toggleDetailScrollable: () => {},
};

const VenueContext = React.createContext<VenueContextValue>(defaultValue);

export default VenueContext;
