// @flow

import type { ComponentType } from 'react';
import React from 'react';
import Loadable, { type LoadingProps } from 'react-loadable';
import LoadingSpinner from 'views/components/LoadingSpinner';
import ApiError from 'views/errors/ApiError';
import { retryImport } from 'utils/error';
import type { Props } from './TodayContainer';
import EventMapInline from '../EventMapInline';
import EventMap from '../EventMap';

const AsyncTodayContainer: ComponentType<Props> = Loadable({
  loader: () => retryImport(() => import(/* webpackChunkName: "today" */ './TodayContainer')),
  loading: (props: LoadingProps) => {
    if (props.error) {
      return <ApiError dataName="page" retry={props.retry} />;
    } else if (props.pastDelay) {
      return <LoadingSpinner />;
    }

    return null;
  },
});

export default AsyncTodayContainer;

export function preload() {
  AsyncTodayContainer.preload();
  EventMapInline.preload();
  EventMap.preload();
}
