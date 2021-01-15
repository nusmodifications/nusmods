import * as React from 'react';
import classnames from 'classnames';
import { Mode, DEFAULT_MODE, LIGHT_MODE, DARK_MODE } from 'types/settings';

type Props = {
  mode: Mode;
  onSelectMode: (mode: Mode) => void;
};

type ModeOption = { value: Mode; label: string };

const MODES: ModeOption[] = [
  {
    label: 'OS Default',
    value: DEFAULT_MODE,
  },
  {
    label: 'On',
    value: DARK_MODE,
  },
  {
    label: 'Off',
    value: LIGHT_MODE,
  },
];

const ModeSelect: React.FC<Props> = ({ mode, onSelectMode }) => (
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

export default ModeSelect;
