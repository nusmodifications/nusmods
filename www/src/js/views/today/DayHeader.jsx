// @flow

import React from 'react';
import { castArray, last } from 'lodash';

import getWeatherIcon from 'views/components/icons/weather';
import Tooltip from 'views/components/Tooltip';
import styles from './DayHeader.scss';
import HeaderDate from './HeaderDate';

type Props = {|
  +date: Date | Date[],
  +forecast?: ?string,
  +offset: number, // number of days from today
|};

export default function(props: Props) {
  const Icon = props.forecast ? getWeatherIcon(props.forecast) : null;

  const dates = castArray(props.date);

  return (
    <header className={styles.header}>
      <h2>
        <div>
          <HeaderDate offset={props.offset}>{dates[0]}</HeaderDate>
        </div>
        {dates.length > 1 && (
          <>
            <div className={styles.to}> to </div>
            <div>
              <HeaderDate offset={props.offset + dates.length - 1}>{last(dates)}</HeaderDate>
            </div>
          </>
        )}
      </h2>

      {Icon && (
        <Tooltip content={props.forecast} placement="bottom" offset={0}>
          <div className={styles.weather} aria-label={props.forecast}>
            <Icon />
          </div>
        </Tooltip>
      )}
    </header>
  );
}
