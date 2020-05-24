import * as React from 'react';
import SearchkitSearchBox from 'views/components/SearchkitSearchBox';

type Props = {
  id: string;
};

const buildQuery = (query: string, options: Record<string, string | string[]>) => ({
  // eslint-disable camelcase
  bool: {
    should: [
      {
        multi_match: {
          query,
          ...options,
          type: 'best_fields',
          operator: 'and',
          fuzziness: 'AUTO',
        },
      },
      {
        multi_match: {
          query,
          ...options,
          type: 'phrase_prefix',
          operator: 'and',
        },
      },
    ],
    minimum_should_match: '1',
    // eslint-enable
  },
});

const ModuleSearchBox: React.FC<Props> = ({ id }) => {
  return (
    <SearchkitSearchBox
      id={id}
      throttle={300}
      queryFields={['moduleCode^10', 'title^3', 'description']}
      queryBuilder={buildQuery}
      placeholder="Module code, names and descriptions"
    />
  );
};

export default ModuleSearchBox;
