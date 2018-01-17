// @flow
import React, { PureComponent } from 'react';
import classnames from 'classnames';
import Downshift from 'downshift';
import _ from 'lodash';

import type { ColorIndex } from 'types/reducers';

import { NUM_DIFFERENT_COLORS } from 'utils/colors';
import styles from './ColorPicker.scss';

type Props = {
  label: string,
  color: ColorIndex,
  onChooseColor: ColorIndex => void,
};

/**
 * ColorPicker presentational component
 *
 * For use in places like changing module colors
 */
class ColorPicker extends PureComponent<Props> {
  // TODO: Inject types from downshift when https://github.com/paypal/downshift/pull/180 is implemented
  renderColorPicker = ({ getButtonProps, getItemProps, isOpen }: any) => (
    <div className={styles.container}>
      <button
        {...getButtonProps({
          title: this.props.label,
        })}
        className={classnames('btn btn-block', `color-${this.props.color}`, styles.moduleColor)}
      />
      {isOpen && (
        <div className={styles.palette}>
          {_.range(NUM_DIFFERENT_COLORS).map((index: ColorIndex) => (
            <button
              {...getItemProps({ item: index })}
              key={index}
              className={classnames(styles.option, `color-${index}`)}
            />
          ))}
        </div>
      )}
    </div>
  );

  render() {
    return (
      <Downshift
        onChange={(colorIndex) => this.props.onChooseColor(colorIndex)}
        render={this.renderColorPicker}
      />
    );
  }
}

export default ColorPicker;
