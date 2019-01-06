// @flow

import type { ComponentType } from 'react';
import React from 'react';
import axios from 'axios';
import { keyBy } from 'lodash';
import Loadable, { type LoadingProps } from 'react-loadable';

import LoadingSpinner from 'views/components/LoadingSpinner';
import ApiError from 'views/errors/ApiError';
import nusmods from 'apis/nusmods';
import type { Props } from './PlannerContainer';

const AsyncTodayContainer: ComponentType<Props> = Loadable.Map({
  loader: {
    TodayContainer: () => import(/* webpackChunkName: "planner" */ './PlannerContainer'),
    modules: () => axios.get(nusmods.modulesUrl()).then(({ data }) => data),
  },
  loading: (props: LoadingProps) => {
    if (props.error) {
      return <ApiError dataName="page" retry={props.retry} />;
    } else if (props.pastDelay) {
      return <LoadingSpinner />;
    }

    return null;
  },
  // This isn't actually a render function, so this lint isn't correct
  // See https://github.com/jamiebuilds/react-loadable#loadablemap
  // eslint-disable-next-line react/prop-types
  render({ TodayContainer, modules }, props) {
    return (
      <TodayContainer.default {...props} modules={keyBy(modules, (module) => module.ModuleCode)} />
    );
  },
});

export default AsyncTodayContainer;
