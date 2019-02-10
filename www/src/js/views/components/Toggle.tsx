// @flow

import React, { PureComponent } from 'react';
import classnames from 'classnames';

type Props = {
  labels: [string, string],
  isOn: ?boolean,
  className?: string,

  onChange: (boolean) => void,
};

export default class Toggle extends PureComponent<Props> {
  static defaultProps = {
    labels: ['On', 'Off'],
  };

  render() {
    const { labels, isOn, onChange, className } = this.props;

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
  }
}
