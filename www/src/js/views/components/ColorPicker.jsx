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
  isHidden: boolean,
  onChooseColor: (ColorIndex) => void,
};

/**
 * ColorPicker presentational component
 *
 * For use in places like changing module colors
 */
class ColorPicker extends PureComponent<Props> {
  // TODO: Inject types from downshift when https://github.com/paypal/downshift/pull/180 is implemented
  renderColorPicker = ({ getToggleButtonProps, getItemProps, isOpen }: any) => {
    const { label, color, isHidden } = this.props;

    return (
      <div className={styles.container}>
        <button
          {...getToggleButtonProps({
            title: label,
          })}
          className={classnames('btn btn-block hoverable', `color-${color}`, styles.moduleColor, {
            [styles.hidden]: isHidden,
          })}
        />
        {isOpen && (
          <div className={styles.palette}>
            {_.range(NUM_DIFFERENT_COLORS).map((index: ColorIndex) => (
              <button
                {...getItemProps({ item: index })}
                key={index}
                className={classnames(styles.option, `color-${index}`, {
                  [styles.selected]: index === color,
                })}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  render() {
    return <Downshift onChange={this.props.onChooseColor} render={this.renderColorPicker} />;
  }
}

export default ColorPicker;
