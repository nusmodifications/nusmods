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
  throttle?: number;
  isLoading?: boolean;
  value: string | null;
  placeholder?: string;
  /** Called when the search box value changes */
  onChange: (value: string) => void;
  /** Called when a search should be triggered, potentially debounced by `throttle` milliseconds. */
  onSearch?: () => void;
  onBlur?: () => void;
};

const SearchBox: FC<Props> = ({
  className,
  throttle,
  isLoading = false,
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
          onSearch?.();
        },
        throttle,
        { leading: false },
      ),
    // FIXME: If these props change, a new debouncedSearch will be created,
    // which may cause weird timing bugs.
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
      const searchTerm = evt.target.value;
      onChange(searchTerm);
      isDirty.current = true;
      debouncedSearch();
    },
    [debouncedSearch, onChange],
  );

  const clearInput = useCallback(() => {
    onChange('');
    isDirty.current = true;
    debouncedSearch();
    // Don't flush debouncedSearch here.
    //
    // Reason: Consider a component (e.g. SearchkitSearchBox) that:
    // 1. Stores the value it received from `onChange` in its component state
    //    using `setState`, and
    // 2. Uses `onSearch` to trigger a search using that state.
    //
    // If we flush here,
    // 1. `onChange` will call `setState` with the new search query.
    // 2. `onSearch` will be called, triggering a search with the component's
    //    search query state variable. Since React hasn't rendered, this state is
    //    the *previous* search query, and the component will have triggered a
    //    search with the previous query.
    // 3. React renders and updates the component's state with the new query.
    //    Of course, since the component doesn't know this happened (it requires a
    //    call to `onSearch`), it won't trigger a search with the new search query.
    //
    // We'll thus want to allow the standard deferring behavior to occur, or
    // perhaps shorten the debouncing to after the next render.
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
