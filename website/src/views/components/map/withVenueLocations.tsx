import React, { ComponentType } from 'react';
import Loadable, { LoadingComponentProps } from 'react-loadable';

import { VenueLocationMap } from 'types/venues';
import { Omit } from 'types/utils';
import LoadingSpinner from 'views/components/LoadingSpinner';
import ApiError from 'views/errors/ApiError';
import { getVenueLocations } from 'apis/github';

export type VenueLocations = {
  readonly venueLocations: VenueLocationMap;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErrorProps = { error: any; retry: () => void };

export type WithVenueLocationsOptions = {
  Error?: ComponentType<ErrorProps>;
  Loading?: ComponentType;
};

const defaultErrorComponent = ({ retry }: ErrorProps) => <ApiError dataName="page" retry={retry} />;
const defaultLoadingComponent = () => <LoadingSpinner />;

/**
 * Higher order component that injects venueLocations into an async loaded
 * component. The component will only render when venueLocations is loaded.
 *
 * @param getComponent Function that returns a Promise resolving to the component
 * @param Error        Component shown when either the component or the data cannot be loaded
 *                     Defaults to <ApiError />
 * @param Loading      Component shown while the data is loading
 *                     Defaults to <LoadingSpinner />
 */
export default function withVenueLocations<Props extends VenueLocations>(
  getComponent: () => Promise<ComponentType<Props>>,
  {
    Error = defaultErrorComponent,
    Loading = defaultLoadingComponent,
  }: WithVenueLocationsOptions = {},
) {
  return Loadable.Map({
    loader: {
      Component: getComponent,
      venueLocations: getVenueLocations,
    },

    loading: (props: LoadingComponentProps) => {
      if (props.error) {
        return (
          <Error
            error={props.error}
            retry={() => {
              // Need to clear the memoized value first, otherwise the promise
              // will always resolve to the same error
              getVenueLocations.clear();
              props.retry();
            }}
          />
        );
      }

      if (props.pastDelay) {
        return <Loading />;
      }

      return null;
    },

    // eslint-disable-next-line react/prop-types
    render({ Component, venueLocations }, props: Omit<Props, keyof VenueLocations>) {
      return <Component venueLocations={venueLocations} {...props as Props} />;
    },
  });
}
