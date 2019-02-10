import { Mode } from 'types/settings';

import * as React from 'react';
import classnames from 'classnames';
import { LIGHT_MODE, DARK_MODE } from 'types/settings';

type Props = {
  mode: Mode;
  onSelectMode: Function;
};
type ModeOption = { value: Mode; label: string };

const MODES: Array<ModeOption> = [
  {
    label: 'On',
    value: DARK_MODE,
  },
  {
    label: 'Off',
    value: LIGHT_MODE,
  },
];

export default function ModeSelect(props: Props) {
  const { mode, onSelectMode } = props;

  return (
    <div className="btn-group" role="group">
      {MODES.map(({ value, label }) => (
        <button
          type="button"
          key={value}
          className={classnames('btn', {
            'btn-primary': mode === value,
            'btn-outline-primary': mode !== value,
          })}
          onClick={() => onSelectMode(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
