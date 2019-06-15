import * as React from 'react';
import SearchkitSearchBox from 'views/components/SearchkitSearchBox';

type Props = {
  id: string;
};

const buildQuery = (query: string, options: Record<string, string | string[]>) => ({
  bool: {
    should: [
      {
        // eslint-disable-next-line @typescript-eslint/camelcase
        multi_match: {
          query,
          ...options,
          type: 'best_fields',
          operator: 'and',
          fuzziness: 'AUTO',
        },
      },
      {
        // eslint-disable-next-line @typescript-eslint/camelcase
        multi_match: {
          query,
          ...options,
          type: 'phrase_prefix',
          operator: 'and',
        },
      },
    ],
    minimum_should_match: '1', // eslint-disable-line @typescript-eslint/camelcase
  },
});

const ModuleSearchBox = ({ id }: Props) => {
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
