import * as React from 'react';
import classnames from 'classnames';
import Downshift, { ChildrenFunction } from 'downshift';
import _ from 'lodash';

import { ColorIndex } from 'types/timetables';

import { NUM_DIFFERENT_COLORS } from 'utils/colors';
import styles from './ColorPicker.scss';

type Props = {
  label: string;
  color: ColorIndex;
  isHidden: boolean;
  onChooseColor: (colorIndex: ColorIndex) => void;
};

/**
 * ColorPicker presentational component
 *
 * For use in places like changing module colors
 */
const ColorPicker = React.memo<Props>((props) => {
  const renderColorPicker: ChildrenFunction<ColorIndex> = ({
    getToggleButtonProps,
    getItemProps,
    getMenuProps,
    isOpen,
  }) => {
    const { label, color, isHidden } = props;

    return (
      <div className={styles.container}>
        <button
          type="button"
          {...getToggleButtonProps({
            title: label,
          })}
          className={classnames('btn btn-block hoverable', `color-${color}`, styles.moduleColor, {
            [styles.hidden]: isHidden,
          })}
        />
        <div
          className={classnames(styles.palette, { [styles.isClosed]: !isOpen })}
          {...getMenuProps()}
        >
          {_.range(NUM_DIFFERENT_COLORS).map((index: ColorIndex) => (
            <button
              type="button"
              {...getItemProps({ item: index })}
              key={index}
              className={classnames(styles.option, `color-${index}`, {
                [styles.selected]: index === color,
              })}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Downshift onChange={(colorIndex) => colorIndex !== null && props.onChooseColor(colorIndex)}>
      {renderColorPicker}
    </Downshift>
  );
});

export default ColorPicker;
