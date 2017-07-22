// @flow
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import type { ColorIndex } from 'types/reducers';

import _ from 'lodash';
import { NUM_DIFFERENT_COLORS } from 'reducers/theme';

import './color-picker.scss';

type Props = {
  onChooseColor: Function,
  handleEscKeyDown: Function,
};

class ColorPicker extends Component {
  props: Props;

  componentWillMount() {
    window.addEventListener('keydown', this.props.handleEscKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.props.handleEscKeyDown);
  }

  render() {
    return (
      <div className="color-picker-container">
        <div className="color-picker">
          {_.range(NUM_DIFFERENT_COLORS).map((index: ColorIndex) => {
            return (
              <span className={`color-option color-${index}`}
                key={index}
                onClick={() => {
                  this.props.onChooseColor(index);
                }} />
            );
          })}
        </div>
      </div>
    );
  }
}

export default ColorPicker;
