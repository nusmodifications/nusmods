import { Button } from 'components/ui/button';
import * as React from 'react';
import Omelette, { matchEgg } from 'views/components/Omelette';
import Warning from './Warning';
import styles from './ErrorPage.scss';

// Should be defined in Searchkit, but it isn't exported.
// https://github.com/searchkit/searchkit/blob/016c899c97f72ea3ad5afc017345e41c9003172a/packages/searchkit/src/components/search/hits/src/NoHitsDisplay.tsx#L6
// import { NoHitsDisplayProps } from 'searchkit';
export interface NoHitsDisplayProps {
  noResultsLabel: string;
  resetFiltersFn: () => void;
  setSuggestionFn: () => void;
  // Approximate typing - searchkit types this as Function, which is even less strict
  translate: (key: string, variables: Record<string, string>) => string;
  suggestion: string;
  query: string;
  filtersCount: number;
}

const ModuleFinderNoHits: React.FC<NoHitsDisplayProps> = ({
  noResultsLabel,
  resetFiltersFn,
  setSuggestionFn,
  suggestion,
  query,
  filtersCount,
  translate,
}) => (
  <>
    <Warning message={noResultsLabel} />

    {matchEgg(query) && <Omelette query={query} />}

    <div className={styles.buttons}>
      {!!suggestion && (
        <Button variant="outline" type="button" onClick={setSuggestionFn}>
          {translate('NoHits.DidYouMean', { suggestion })}
        </Button>
      )}
      {filtersCount > 0 && (
        <Button variant="outline" type="button" onClick={resetFiltersFn}>
          {translate('NoHits.SearchWithoutFilters', { query })}
        </Button>
      )}
    </div>
  </>
);

export default ModuleFinderNoHits;
