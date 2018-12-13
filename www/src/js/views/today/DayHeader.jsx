// @flow

import React from 'react';
import { format } from 'date-fns';
import getWeatherIcon from 'views/components/icons/weather';
import Tooltip from 'views/components/Tooltip/Tooltip';
import styles from './TodayContainer.scss';

type Props = {|
  +date: Date,
  +dayName: ?string, // eg. Today, Tomorrow
  +forecast: ?string,
|};

function getDayName(date: Date) {
  return format(date, 'iiii, do MMMM');
}

export default function(props: Props) {
  const Icon = props.forecast ? getWeatherIcon(props.forecast) : null;

  return (
    <header className={styles.header}>
      <h2>
        <span className={styles.date}>{getDayName(props.date)}</span>
        {props.dayName}
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
