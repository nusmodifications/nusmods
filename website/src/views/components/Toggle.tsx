import * as React from 'react';
import classnames from 'classnames';

type Props = {
  labels: [string, string];
  isOn?: boolean | null;
  className?: string;

  onChange: (boolean: boolean) => void;
};

const Toggle = (props: Props) => {
  return (
    <div className="btn-group" role="group">
      {props.labels.map((label, index) => {
        const value = index === 0;

        return (
          <button
            key={label}
            type="button"
            className={classnames('btn', props.className, {
              'btn-primary': value === props.isOn,
              'btn-outline-primary': value !== props.isOn,
            })}
            onClick={() => {
              if (value !== props.isOn) props.onChange(value);
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

Toggle.defaultProps = {
  labels: ['On', 'Off'],
};

export default React.memo(Toggle);
