// @flow
import React, { PureComponent } from 'react';
import classnames from 'classnames';
import _ from 'lodash';

import type { ColorIndex } from 'types/reducers';

import { NUM_DIFFERENT_COLORS } from 'reducers/theme';

import Downshift from 'downshift';
import styles from './ColorPicker.scss';

type Props = {
  label: string,
  color: ColorIndex,
  onChooseColor: Function
};

/**
 * ColorPicker presentational component
 *
 * For use in places like changing module colors
 */
class ColorPicker extends PureComponent<Props> {
  // TODO: Inject types from downshift when https://github.com/paypal/downshift/pull/180 is implemented
  renderColorPicker = ({
    getButtonProps,
    getItemProps,
    itemToString,
    isOpen,
  }: any) => {
    return (
      <div className={styles.container}>
        <button
          {...getButtonProps({
            title: this.props.label,
          })}
          className={classnames(
            `color-${this.props.color}`,
            styles.moduleColor,
          )}
        />
        {isOpen && (
          <div className={styles.palette}>
            {_.range(NUM_DIFFERENT_COLORS).map((index: ColorIndex) => (
              <span
                {...getItemProps({ item: itemToString(index) })}
                key={index}
                className={classnames(styles.option, `color-${index}`)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  render() {
    return (
      <Downshift
        onChange={this.props.onChooseColor}
        render={this.renderColorPicker}
      />
    );
  }
}

export default ColorPicker;
