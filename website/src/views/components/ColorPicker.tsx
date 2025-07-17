import { memo } from 'react';
import classnames from 'classnames';
import Downshift, { ChildrenFunction } from 'downshift';
import _ from 'lodash';

import { ColorIndex } from 'types/timetables';
import { NUM_DIFFERENT_COLORS, TRANSPARENT_COLOR_INDEX } from 'utils/colors';

import TransparentIcon from 'img/icons/transparent.svg';
import styles from './ColorPicker.scss';

type Props = {
  label: string;
  color: ColorIndex;
  isHidden: boolean;
  isTa: boolean;
  onChooseColor: (colorIndex: ColorIndex) => void;
};

/**
 * ColorPicker presentational component
 *
 * For use in places like changing module colors
 */
const ColorPicker = memo<Props>((props) => {
  const renderColorPicker: ChildrenFunction<ColorIndex> = ({
    getToggleButtonProps,
    getItemProps,
    getMenuProps,
    isOpen,
  }) => {
    const { label, color, isHidden, isTa } = props;

    return (
      <div
        className={classnames(styles.container, {
          [styles.hidden]: isHidden,
          [styles.ta]: isTa,
        })}
      >
        <button
          type="button"
          {...getToggleButtonProps({
            title: label,
          })}
          className={classnames(
            'btn btn-block hoverable',
            color === TRANSPARENT_COLOR_INDEX ? styles.transparentColor : `color-${color}`,
            styles.moduleColor,
            {
              [styles.hidden]: isHidden,
              [styles.ta]: isTa,
            },
          )}
        />
        <div
          className={classnames(styles.palette, { [styles.isClosed]: !isOpen })}
          {...getMenuProps()}
        >
          {_.range(NUM_DIFFERENT_COLORS).map((index: ColorIndex) => (
            <button
              type="button"
              {...getItemProps({ item: index === color ? TRANSPARENT_COLOR_INDEX : index })}
              key={index}
              className={classnames(styles.option, `color-${index}`, {
                [styles.selected]: index === color,
              })}
            >
              {index === color && <TransparentIcon className={styles.transparentIcon} />}
            </button>
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
