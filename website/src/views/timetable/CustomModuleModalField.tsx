import classNames from 'classnames';
import React, { ChangeEvent } from 'react';
import styles from './CustomModuleModalField.scss';

interface CustomModuleModalFieldProps {
  id: string;
  defaultValue?: string;
  label: string;
  errors: Record<string, string>;
  setLessonStateViaInput: (e: ChangeEvent<HTMLInputElement>) => void;
}

const CustomModuleModalField: React.FC<CustomModuleModalFieldProps> = ({
  id,
  errors,
  label,
  defaultValue,
  setLessonStateViaInput,
}) => (
  <>
    <label htmlFor={`select-${id}`}>{label}</label>
    <input
      id={`select-${id}`}
      name={id}
      onChange={(e) => {
        setLessonStateViaInput(e);
      }}
      className={classNames(
        styles.inputField,
        'form-control',
        `${errors[id] ? 'alert alert-danger' : ''}`,
      )}
      defaultValue={defaultValue ?? ''}
      required
    />
    <small className={styles.errorLabel}>{errors[id] ?? ''}</small>
  </>
);
export default CustomModuleModalField;
