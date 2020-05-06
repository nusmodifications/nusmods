import * as React from 'react';
import classnames from 'classnames';

type Props = {
  labels?: [string, string];
  isOn?: boolean | null;
  className?: string;

  onChange: (boolean: boolean) => void;
};

const Toggle: React.FC<Props> = ({ labels = ['On', 'Off'], ...props }) => {
  return (
    <div className="btn-group" role="group">
      {labels.map((label, index) => {
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

export default React.memo(Toggle);
