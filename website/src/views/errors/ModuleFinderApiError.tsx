import React from 'react';
import { NoHitsErrorDisplayProps } from 'searchkit';
import ApiError from './ApiError';

const ModuleFinderApiError = ({ resetSearchFn }: NoHitsErrorDisplayProps) => {
  return <ApiError dataName="module information" retry={resetSearchFn} />;
};

export default ModuleFinderApiError;
