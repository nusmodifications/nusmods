import { ToggleGroup, ToggleGroupItem } from 'components/ui/toggle-group';
import * as React from 'react';
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
  <ToggleGroup
    type="single"
    value={colorScheme}
    onValueChange={(value) => {
      if (value) onSelectColorScheme(value as ColorSchemePreference);
    }}
    aria-label="Night Mode"
  >
    {MODES.map(({ value, label }) => (
      <ToggleGroupItem value={value} key={value}>
        {label}
      </ToggleGroupItem>
    ))}
  </ToggleGroup>
);

export default ModeSelect;
