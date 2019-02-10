import * as React from 'react';
import classnames from 'classnames';

type Props = {
  newStudent: boolean;
  onSelectNewStudent: Function; // will be called with the selected faculty when option changes
};

export default function NewStudentSelect(props: Props) {
  const { newStudent, onSelectNewStudent } = props;

  return (
    <div className="btn-group" role="group">
      <button
        type="button"
        className={classnames('btn', {
          'btn-primary': newStudent,
          'btn-outline-primary': !newStudent,
        })}
        onClick={() => onSelectNewStudent(true)}
      >
        Yes
      </button>
      <button
        type="button"
        className={classnames('btn', {
          'btn-primary': !newStudent,
          'btn-outline-primary': newStudent,
        })}
        onClick={() => onSelectNewStudent(false)}
      >
        No
      </button>
    </div>
  );
}
