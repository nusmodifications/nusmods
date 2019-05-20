import React from 'react';
import { NoHitsDisplayProps } from 'searchkit';
import Omelette, { matchEgg } from 'views/components/Omelette';
import Warning from './Warning';
import styles from './ErrorPage.scss';

const ModuleFinderNoHits = ({
  noResultsLabel,
  resetFiltersFn,
  setSuggestionFn,
  suggestion,
  query,
  filtersCount,
  translate,
}: NoHitsDisplayProps) => {
  return (
    <>
      <Warning message={noResultsLabel} />

      {matchEgg(query) && <Omelette query={query} />}

      <div className={styles.buttons}>
        {!!suggestion && (
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => setSuggestionFn()}
          >
            {translate('NoHits.DidYouMean', { suggestion })}
          </button>
        )}
        {filtersCount > 0 && (
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => resetFiltersFn()}
          >
            {translate('NoHits.SearchWithoutFilters', { query })}
          </button>
        )}
      </div>
    </>
  );
};

export default ModuleFinderNoHits;
