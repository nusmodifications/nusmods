import * as React from 'react';
import ApiError from './ApiError';

// Should be defined in Searchkit, but it isn't exported.
// https://github.com/searchkit/searchkit/blob/016c899c97f72ea3ad5afc017345e41c9003172a/packages/searchkit/src/components/search/hits/src/NoHitsErrorDisplay.tsx#L6
// import { NoHitsErrorDisplayProps } from 'searchkit';
type NoHitsErrorDisplayProps = {
  resetSearchFn: () => void;
};

const ModuleFinderApiError: React.FC<NoHitsErrorDisplayProps> = ({ resetSearchFn }) => (
  <ApiError dataName="module information" retry={resetSearchFn} />
);

export default ModuleFinderApiError;
