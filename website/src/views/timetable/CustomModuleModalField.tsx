import React, { ChangeEvent } from 'react';

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
}) => {
  return (
    <>
      <label htmlFor={'select-' + id}>{label}</label>
      <input
        id={'select-' + id}
        name={id}
        onChange={(e) => {
          console.log(e);
          setLessonStateViaInput(e);
        }}
        className={`form-control ${errors[id] ? 'alert alert-danger' : ''}`}
        defaultValue={defaultValue ?? ''}
        required
      />
    </>
  );
};

export default CustomModuleModalField;
