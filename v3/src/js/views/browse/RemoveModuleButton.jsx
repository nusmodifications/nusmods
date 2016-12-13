// @flow
import React from 'react';

type Props = {
  onClick: Function,
  semester: number,
}

export default function RemoveModuleButton(props: Props) {
  const {
    onClick,
    semester,
  } = props;

  return (
    <button className="btn-link btn-remove" onClick={onClick}>
      Remove from Semester {semester}
    </button>
  );
}
