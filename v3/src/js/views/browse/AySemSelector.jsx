// @flow
import React from 'react';
import classnames from 'classnames';

type Props = {
  aySems: string[],
  selectedAySem: string,
  onSelectAySem: Function,
}

export default function AySemSelector(props: Props) {
  const {
    aySems,
    selectedAySem,
    onSelectAySem,
  } = props;

  const buttons = aySems.map(aySem =>
    <button key={aySem} onClick={() => onSelectAySem(aySem)}
      type="button"
      className={classnames('btn', {
        'btn-primary': selectedAySem === aySem,
        'btn-secondary': selectedAySem !== aySem,
      })}
    >
      {aySem}
    </button>
  );

  return (
    <div className="btn-group btn-group-sm" role="group" aria-label="Academic Years and Semesters">
      {buttons}
    </div>
  );
}
