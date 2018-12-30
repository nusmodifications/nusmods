// @flow
import type { Mode } from 'types/settings';

import React from 'react';
import classnames from 'classnames';
import { LIGHT_MODE, DARK_MODE } from 'types/settings';

type Props = {
  mode: Mode,
  onSelectMode: Function,
  enableOsMode: Function,
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
    label: 'OS',
    value: true,
  },
];

export default function ModeSelect(props: Props) {
  const { enableOsMode, mode, onSelectMode } = props;
  const mqlLight = matchMedia('(prefers-color-scheme: light)');
  const mqlDark = matchMedia('(prefers-color-scheme: dark)');
  const browserSupport = mqlLight.matches || mqlDark.matches;
  return (
    <div className="btn-group" role="group">
      {MODES.filter(({ label }) => label !== 'OS' || browserSupport).map(
        ({ value, label }) =>
          label !== 'OS' ? (
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
          ) : (
            <button
              type="button"
              key={value}
              className={classnames('btn', {
                'btn-primary': mode === value,
                'btn-outline-primary': mode !== value,
              })}
              onClick={() => {
                if (mqlLight.matches) enableOsMode('LIGHT');
                else enableOsMode('DARK');
              }}
            >
              {label}
            </button>
          ),
      )}
    </div>
  );
}
