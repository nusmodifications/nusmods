// @flow

import React from 'react';
import Loadable, { type LoadingProps } from 'react-loadable';

import { getContributors } from 'apis/github';
import ApiError from 'views/errors/ApiError';
import LoadingSpinner from 'views/components/LoadingSpinner';
import ContributorList from './ContributorList';

type Props = {
  size?: number,
};

// Wrapper around ContributorList that loads contributor data
const AsyncContributorList = Loadable.Map<Props, *>({
  loader: {
    contributors: () => getContributors(),
  },
  loading: (props: LoadingProps) => {
    if (props.error) {
      return <ApiError dataName="venue locations" retry={props.retry} />;
    } else if (props.pastDelay) {
      return <LoadingSpinner />;
    }

    return null;
  },

  // This is not a proper render function, so prop validation doesn't work
  /* eslint-disable react/prop-types */
  render(loaded, props: Props) {
    let { contributors } = loaded;
    if (props.size) contributors = contributors.slice(0, props.size);

    return <ContributorList contributors={contributors} />;
  },
});

export default AsyncContributorList;
