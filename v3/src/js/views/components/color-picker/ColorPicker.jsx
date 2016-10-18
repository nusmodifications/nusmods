// @flow
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';

import _ from 'lodash';

require('./color-picker.scss');

type Props = {
  onChooseColor: Function,
};

class ColorPicker extends Component {
  props: Props;

  render() {
    return (
      <div className="color-picker-container">
        <div className="color-picker">
          {_.range(8).map((index) => {
            return (
              <span className={`color-option color-${index}`}
                key={index}
                onClick={() => {
                  this.props.onChooseColor(index);
                }}/>
            );
          })}
        </div>
      </div>
    );
  }
}

export default ColorPicker;
