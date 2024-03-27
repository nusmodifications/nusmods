import React from 'react';
import { SearchkitManager } from 'searchkit';
import ApiError from './ApiError';

type ModuleFinderApiErrorProps = {
  searchkit: SearchkitManager;
};

const ModuleFinderApiError: React.FC<ModuleFinderApiErrorProps> = ({ searchkit }) => (
  <ApiError dataName="course information" retry={() => searchkit.reloadSearch()} />
);

export default ModuleFinderApiError;
