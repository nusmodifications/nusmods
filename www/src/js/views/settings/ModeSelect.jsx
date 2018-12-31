// @flow
import type { Mode } from 'types/settings';

import React from 'react';
import classnames from 'classnames';
import { LIGHT_MODE, DARK_MODE } from 'types/settings';

type Props = {
  mode: Mode,
  onSelectMode: Function,
  enableOsMode: Function,
  osEnabled: boolean,
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
    label: 'OS DEFAULT',
    value: true,
  },
];

export default function ModeSelect(props: Props) {
  const { osEnabled, enableOsMode, mode, onSelectMode } = props;
  const mqlLight = matchMedia('(prefers-color-scheme: light)');
  const mqlDark = matchMedia('(prefers-color-scheme: dark)');
  const browserSupport = mqlLight.matches || mqlDark.matches;
  return (
    <div className="btn-group" role="group">
      {MODES.filter(({ label }) => label !== 'OS DEFAULT' || browserSupport).map(
        ({ value, label }) =>
          label !== 'OS DEFAULT' ? (
            <button
              type="button"
              key={value}
              className={classnames('btn', {
                'btn-primary': !osEnabled && mode === value,
                'btn-outline-primary': osEnabled || mode !== value,
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
                'btn-primary': osEnabled,
                'btn-outline-primary': !osEnabled,
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
