// @flow
import React, { Component } from 'react';
import _ from 'lodash';

import type { ColorIndex } from 'types/reducers';

import { NUM_DIFFERENT_COLORS } from 'reducers/theme';

import './color-picker.scss';

const ESCAPE_KEYCODE = 27;
const EVENT_TYPE = 'keydown';

type Props = {
  onChooseColor: Function,
  onDismiss: Function,
};

class ColorPicker extends Component<Props> {
  componentWillMount() {
    window.addEventListener(EVENT_TYPE, this.handleKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener(EVENT_TYPE, this.handleKeyDown);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' || event.keyCode === ESCAPE_KEYCODE) {
      this.props.onDismiss();
    }
  };

  render() {
    return (
      <div className="color-picker-container">
        <div className="color-picker">
          {_.range(NUM_DIFFERENT_COLORS).map((index: ColorIndex) => {
            return (
              <span
                className={`color-option color-${index}`}
                key={index}
                onClick={() => {
                  this.props.onChooseColor(index);
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

export default ColorPicker;
