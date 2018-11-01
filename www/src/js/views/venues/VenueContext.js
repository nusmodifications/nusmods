// @flow
import { createContext } from 'react';

type VenueContextValue = {|
  +toggleDetailScrollable: (boolean) => void,
|};

const defaultValue: VenueContextValue = {
  // Sets scrollable-y on the .venueDetail container. Setting this to false
  // allows the content of the container to overflow the container
  toggleDetailScrollable: () => {},
};

const VenueContext = createContext(defaultValue);

export default VenueContext;
