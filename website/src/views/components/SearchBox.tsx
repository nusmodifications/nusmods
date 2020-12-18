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

  // This is a ref instead of state as it is only used within event handlers and
  // we don't want to trigger unnecessary renders when it's changed.
  const isDirty = useRef(false);

  const handleSubmit: FormEventHandler = useCallback((event) => {
    event.preventDefault();
    const element = searchElement.current;
    if (!element) return;
    // element's onBlur callback will trigger the search flow. If we also
    // invoke onSearch in onSubmit, onSearch will be called twice.
    element.blur();
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce(
        () => {
          isDirty.current = false;
          onSearch();
        },
        throttle,
        { leading: false },
      ),
    [onSearch, throttle],
  );

  const handleFocus = useCallback(() => setIsFocused(true), []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);

    onBlur?.();

    const element = searchElement.current;
    if (!element) return;

    // Don't search if no changes
    if (!isDirty.current) return;

    const searchTerm = element.value;
    onChange(searchTerm);
    debouncedSearch();
    debouncedSearch.flush();
  }, [debouncedSearch, onBlur, onChange]);

  const handleInput: ChangeEventHandler<HTMLInputElement> = useCallback(
    (evt) => {
      if (evt.target instanceof HTMLInputElement) {
        const searchTerm = evt.target.value;
        onChange(searchTerm);
        isDirty.current = true;
        debouncedSearch();
      }
    },
    [debouncedSearch, onChange],
  );

  const clearInput = useCallback(() => {
    onChange('');
    isDirty.current = true;
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
          <X
            className={styles.removeInput}
            onClick={clearInput}
            pointerEvents="bounding-box"
            role="button"
            aria-label="Clear search"
          />
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
