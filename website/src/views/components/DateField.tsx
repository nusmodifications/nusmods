import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
  ChangeEventHandler,
  InputHTMLAttributes,
} from 'react';
import styles from './DateField.scss';
import { getDate, getMonth, getYear, isValid, parse } from 'date-fns';
import classNames from 'classnames';

interface CustomModuleModalWeekRangeSelectorProps {
  defaultDate?: Date;
  onChange: (date: Date) => void;
}

const DateField: React.FC<CustomModuleModalWeekRangeSelectorProps> = ({
  defaultDate = new Date(),
  onChange,
}) => {
  const [day, setDay] = useState(getDate(defaultDate).toString());
  const [month, setMonth] = useState(getMonth(defaultDate).toString());
  const [year, setYear] = useState(getYear(defaultDate).toString());

  const [fullDate, setFullDate] = useState(defaultDate);

  const monthRef = useRef<HTMLInputElement | null>(null);
  const yearRef = useRef<HTMLInputElement | null>(null);

  const resetToLastValid = useCallback(() => {
    const tmpDate = parse(`${year}-${month}-${day}`, 'yyyy-MM-dd', new Date());

    // Ensure valid date and year is not some ridiculous number
    if (isValid(tmpDate) && tmpDate.getFullYear() > 2000 && tmpDate.getFullYear() < 2100) {
      setFullDate(tmpDate);
    } else {
      setDay(getDate(fullDate).toString());
      setMonth(getMonth(fullDate).toString());
      setYear(getYear(fullDate).toString());
    }
  }, [day, month, year, fullDate]);

  // Update parent component when date changes
  useEffect(() => {
    onChange(fullDate);
  }, [fullDate]);

  const handleDayChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value;
    if (/^\d{0,2}$/.test(value)) {
      setDay(value);

      if (value.length === 2) {
        monthRef.current?.focus();
      }
    }
  };

  const handleMonthChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value;
    if (/^\d{0,2}$/.test(value)) {
      setMonth(value);

      if (value.length === 2) {
        yearRef.current?.focus();
      }
    }
  };

  const handleYearChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value;
    if (/^\d{0,4}$/.test(value)) {
      setYear(value);
    }
  };

  // Track if field is focused to apply styles
  const [numFieldFocus, setNumFieldFocus] = useState(0);
  const focusCountHandlers: InputHTMLAttributes<HTMLInputElement> = {
    onBlur: () => {
      setNumFieldFocus((n) => n - 1);
    },
    onFocus: (e) => {
      e.target.select();
      setNumFieldFocus((n) => n + 1);
    },
  };

  useEffect(() => {
    if (numFieldFocus === 0) {
      resetToLastValid();
    }
  }, [numFieldFocus]);

  return (
    <div className={styles.container}>
      <div className={classNames(styles.row, 'form-control', numFieldFocus ? styles.focused : '')}>
        <input
          {...focusCountHandlers}
          value={day}
          onChange={handleDayChange}
          placeholder="DD"
          maxLength={2}
        />
        <span>/</span>
        <input
          {...focusCountHandlers}
          value={month}
          onChange={handleMonthChange}
          placeholder="MM"
          maxLength={2}
          ref={monthRef}
        />
        <span>/</span>
        <input
          {...focusCountHandlers}
          value={year}
          onChange={handleYearChange}
          placeholder="YYYY"
          maxLength={4}
          ref={yearRef}
        />
      </div>
    </div>
  );
};

export default DateField;
