// @flow

import React from 'react';
import getWeatherIcon from 'views/components/icons/weather';
import styles from './TodayContainer/TodayContainer.scss';
import HeaderDate from './HeaderDate';

type Props = {|
  +date: Date,
  +forecast: ?string,
  +offset: number, // number of days from today
|};

export default function(props: Props) {
  const Icon = props.forecast ? getWeatherIcon(props.forecast) : null;

  return (
    <header className={styles.header}>
      <h2>
        <HeaderDate offset={props.offset}>{props.date}</HeaderDate>
      </h2>

      {Icon && (
        <div className={styles.weather} title={props.forecast} aria-label={props.forecast}>
          <Icon />
        </div>
      )}
    </header>
  );
}
