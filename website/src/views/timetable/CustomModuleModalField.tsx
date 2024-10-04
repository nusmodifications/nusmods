import classNames from 'classnames';
import React, { ChangeEvent } from 'react';
import styles from './CustomModuleModalField.scss';

interface CustomModuleModalFieldProps {
  id: string;
  defaultValue?: string;
  label?: string;
  errors?: Record<string, string>;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const CustomModuleModalField: React.FC<CustomModuleModalFieldProps> = ({
  id,
  errors,
  label,
  defaultValue,
  onChange,
}) => (
  <>
    {label && <label htmlFor={`select-${id}`}>{label}</label>}
    <input
      id={`select-${id}`}
      name={id}
      onChange={(e) => {
        onChange(e);
      }}
      className={classNames(
        styles.inputField,
        'form-control',
        `${errors && errors[id] ? 'alert alert-danger' : ''}`,
      )}
      defaultValue={defaultValue ?? ''}
      required
    />
    {errors && <small className={styles.errorLabel}>{errors[id] ?? ''}</small>}
  </>
);
export default CustomModuleModalField;
