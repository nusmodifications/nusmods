import * as React from 'react';
import classnames from 'classnames';

type Props = {
  labels: [string, string];
  isOn?: boolean | null;
  className?: string;

  onChange: (boolean: boolean) => void;
};

const Toggle = React.memo<Props>(({ labels = ['On', 'Off'], isOn, onChange, className }) => {
  return (
    <div className="btn-group" role="group">
      {labels.map((label, index) => {
        const value = index === 0;

        return (
          <button
            key={label}
            type="button"
            className={classnames('btn', className, {
              'btn-primary': value === isOn,
              'btn-outline-primary': value !== isOn,
            })}
            onClick={() => {
              if (value !== isOn) onChange(value);
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
});

export default Toggle;
