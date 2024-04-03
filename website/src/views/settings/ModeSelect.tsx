import * as React from 'react';
import classnames from 'classnames';
import {
  ColorSchemePreference,
  SYSTEM_COLOR_SCHEME_PREFERENCE,
  LIGHT_COLOR_SCHEME_PREFERENCE,
  DARK_COLOR_SCHEME_PREFERENCE,
} from 'types/settings';

type Props = {
  colorScheme: ColorSchemePreference;
  onSelectColorScheme: (mode: ColorSchemePreference) => void;
};

type ModeOption = { value: ColorSchemePreference; label: string };

const MODES: ModeOption[] = [
  {
    label: 'Auto',
    value: SYSTEM_COLOR_SCHEME_PREFERENCE,
  },
  {
    label: 'On',
    value: DARK_COLOR_SCHEME_PREFERENCE,
  },
  {
    label: 'Off',
    value: LIGHT_COLOR_SCHEME_PREFERENCE,
  },
];

const ModeSelect: React.FC<Props> = ({ colorScheme, onSelectColorScheme }) => (
  <div className="btn-group" role="group">
    {MODES.map(({ value, label }) => (
      <button
        type="button"
        key={value}
        className={classnames('btn', {
          'btn-primary': colorScheme === value,
          'btn-outline-primary': colorScheme !== value,
        })}
        onClick={() => onSelectColorScheme(value)}
      >
        {label}
      </button>
    ))}
  </div>
);

export default ModeSelect;
