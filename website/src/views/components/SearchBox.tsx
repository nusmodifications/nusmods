import React, { useState, useCallback, useMemo, useRef } from 'react';
import classnames from 'classnames';

import LoadingSpinner from 'views/components/LoadingSpinner';
import { Search, X } from 'react-feather';
import styles from './SearchBox.scss';

type Props = {
  className?: string;
  throttle: number;
  useInstantSearch: boolean;
  isLoading: boolean;
  value: string | null;
  placeholder?: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  onBlur?: () => void;
};

type State = {
  isFocused: boolean;
  hasChanges: boolean;
};

const SearchBox: React.FC<Props> = ({
  className,
  useInstantSearch,
  isLoading,
  value,
  placeholder,
  onChange,
  onSearch,
  onBlur: onBlurProp,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const searchElement = useRef<HTMLInputElement>(null);

  const onSubmit = useCallback(() => {
    const element = searchElement.current;
    if (!element) return;
    // element's onBlur callback will trigger the search flow. If we also
    // invoke onSearch in onSubmit, onSearch will be called twice.
    element.blur();
  }, []);

  const search = useCallback(() => {
    setHasChanges(false);
    if (onSearch) onSearch();
  }, [onSearch, setHasChanges]);

  const onBlur = useCallback(() => {
    if (onBlurProp) onBlurProp();

    const element = searchElement.current;
    if (!element) return;

    // Don't search if no changes
    if (!hasChanges) return;

    const searchTerm = element.value;
    onChange(searchTerm);
    search();
  }, [search, hasChanges, onBlurProp, onChange]);

  const onInput = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      if (evt.target instanceof HTMLInputElement) {
        const searchTerm = evt.target.value;
        setHasChanges(true);
        onChange(searchTerm);
        if (useInstantSearch) search();
      }
    },
    [onChange, setHasChanges, useInstantSearch, search],
  );

  const onRemoveInput = useCallback(() => {
    onChange('');
    setHasChanges(true);
    if (useInstantSearch) search();
  }, [search, onChange, setHasChanges, useInstantSearch]);

  const showSubmitHelp = useMemo(() => {
    return !useInstantSearch && hasChanges && searchElement.current && searchElement.current.value;
  }, [useInstantSearch, hasChanges]);

  return (
    <div
      className={classnames(className, {
        [styles.searchBoxFocused]: isFocused,
      })}
    >
      <label htmlFor="search-box" className="sr-only">
        Search
      </label>
      <form
        className={styles.searchWrapper}
        onSubmit={(evt) => {
          onSubmit();
          evt.preventDefault();
        }}
      >
        {isLoading ? (
          <div className={classnames(styles.leftAccessory, styles.spinnerContainer)}>
            <LoadingSpinner className={styles.spinner} small />
          </div>
        ) : (
          <Search className={classnames(styles.leftAccessory, styles.searchIcon)} />
        )}
        {value && (
          <X className={styles.removeInput} onClick={onRemoveInput} pointerEvents="bounding-box" />
        )}
        <input
          id="search-box"
          className="form-control form-control-lg"
          type="search"
          autoComplete="off"
          ref={searchElement}
          value={value || ''}
          onChange={onInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur();
          }}
          placeholder={placeholder}
          spellCheck
        />
      </form>

      {showSubmitHelp && <p className={styles.searchHelp}>Press enter to search</p>}
    </div>
  );
};

export default SearchBox;
