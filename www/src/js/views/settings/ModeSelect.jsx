// @flow
import type { Mode } from 'types/settings';

import React from 'react';
import classnames from 'classnames';
import { LIGHT_MODE, DARK_MODE, OS_MODE } from 'types/settings';

type Props = {
  mode: Mode,
  onSelectMode: Function,
  enableOsMode: Function,
  userPreference: Mode,
};
type ModeOption = { value: Mode, label: string };

const MODES: Array<ModeOption> = [
  {
    label: 'On',
    value: DARK_MODE,
  },
  {
    label: 'Off',
    value: LIGHT_MODE,
  },
  {
    label: 'OS mode',
    value: OS_MODE,
  },
];

export default function ModeSelect(props: Props) {
  const { enableOsMode, userPreference, onSelectMode } = props;
  const mqlLight = matchMedia('(prefers-color-scheme: light)');
  const mqlDark = matchMedia('(prefers-color-scheme: dark)');
  const browserSupport = mqlLight.matches || mqlDark.matches;
  return (
    <div className="btn-group" role="group">
      {MODES.filter(({ label }) => label !== 'OS mode' || browserSupport).map(
        ({ value, label }) =>
          label !== 'OS mode' ? (
            <button
              type="button"
              key={value}
              className={classnames('btn', {
                'btn-primary': userPreference === value,
                'btn-outline-primary': userPreference !== value,
              })}
              onClick={() => onSelectMode(value)}
            >
              {label}
            </button>
          ) : (
            <button
              type="button"
              key={value}
              className={classnames('btn', {
                'btn-primary': userPreference === value,
                'btn-outline-primary': userPreference !== value,
              })}
              onClick={() => {
                if (mqlLight.matches) enableOsMode('LIGHT');
                else if (mqlDark.matches) enableOsMode('DARK');
              }}
            >
              {label}
            </button>
          ),
      )}
    </div>
  );
}
