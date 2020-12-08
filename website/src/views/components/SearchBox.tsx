import {
  ChangeEventHandler,
  FC,
  FormEventHandler,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import classnames from 'classnames';
import { debounce } from 'lodash';
import { Search, X } from 'react-feather';
import LoadingSpinner from 'views/components/LoadingSpinner';
import styles from './SearchBox.scss';

export type Props = {
  className?: string;
  throttle: number;
  isLoading: boolean;
  value: string | null;
  placeholder?: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onBlur?: () => void;
};

const SearchBox: FC<Props> = ({
  className,
  throttle,
  isLoading,
  value,
  placeholder,
  onChange,
  onSearch,
  onBlur,
}) => {
  const searchElement = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSubmit: FormEventHandler = useCallback((event) => {
    event.preventDefault();
    const element = searchElement.current;
    if (!element) return;
    // element's onBlur callback will trigger the search flow. If we also
    // invoke onSearch in onSubmit, onSearch will be called twice.
    element.blur();
  }, []);

  const search = useCallback(() => {
    setHasChanges(false);
    onSearch();
  }, [onSearch]);

  const debouncedSearch = useMemo(
    () =>
      debounce(search, throttle, {
        leading: false,
      }),
    [search, throttle],
  );

  const handleFocus = useCallback(() => setIsFocused(true), []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);

    onBlur?.();

    const element = searchElement.current;
    if (!element) return;

    // Don't search if no changes
    if (!hasChanges) return;

    const searchTerm = element.value;
    onChange(searchTerm);
    debouncedSearch();
    debouncedSearch.flush();
  }, [debouncedSearch, hasChanges, onBlur, onChange]);

  const handleInput: ChangeEventHandler<HTMLInputElement> = useCallback(
    (evt) => {
      if (evt.target instanceof HTMLInputElement) {
        const searchTerm = evt.target.value;
        onChange(searchTerm);
        setHasChanges(true);
        debouncedSearch();
      }
    },
    [debouncedSearch, onChange],
  );

  const clearInput = useCallback(() => {
    onChange('');
    setHasChanges(true);
    debouncedSearch();
  }, [debouncedSearch, onChange]);

  return (
    <div
      className={classnames(className, {
        [styles.searchBoxFocused]: isFocused,
      })}
    >
      <label htmlFor="search-box" className="sr-only">
        Search
      </label>
      <form className={styles.searchWrapper} onSubmit={handleSubmit}>
        {isLoading ? (
          <div className={classnames(styles.leftAccessory, styles.spinnerContainer)}>
            <LoadingSpinner className={styles.spinner} small />
          </div>
        ) : (
          <Search className={classnames(styles.leftAccessory, styles.searchIcon)} />
        )}
        {value && (
          <X className={styles.removeInput} onClick={clearInput} pointerEvents="bounding-box" />
        )}
        <input
          id="search-box"
          className="form-control form-control-lg"
          type="search"
          autoComplete="off"
          ref={searchElement}
          value={value || ''}
          onChange={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          spellCheck
        />
      </form>
    </div>
  );
};

export default SearchBox;
