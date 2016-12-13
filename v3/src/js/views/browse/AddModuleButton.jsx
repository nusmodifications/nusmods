// @flow
import React from 'react';

type Props = {
  onClick: Function,
  semester: number,
}

export default function AddModuleButton(props: Props) {
  const {
    onClick,
    semester,
  } = props;

  return (
    <button className="btn-link btn-add" onClick={onClick}>
      Add to Semester {semester}
    </button>
  );
}
