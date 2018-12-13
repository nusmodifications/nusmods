// @flow

import React from 'react';
import { last } from 'lodash';
import type { EmptyGroupType } from 'types/views';
import * as icons from 'views/components/icons/svg';
import HeaderDate from './HeaderDate';
import styles from './TodayContainer.scss';

type Props = {
  dates: Date[],
  type: EmptyGroupType,
  offset: number,
};

function renderType(type: EmptyGroupType) {
  switch (type) {
    case 'winter':
      return (
        <>
          <img src={icons.winter} alt="" />
          <p>Enjoy your winter break!</p>
        </>
      );

    case 'summer':
      return (
        <>
          <img src={icons.beach} alt="" />
          <p>Enjoy your summer break!</p>
        </>
      );

    case 'holiday':
      return (
        <>
          <img src={icons.confetti} alt="" />
          <p>Happy holiday!</p>
        </>
      );

    case 'weekend':
      return (
        <>
          <img src={icons.books} alt="" />
          <p>It&apos;s the weekend!</p>
        </>
      );

    case 'orientation':
      return (
        <>
          <img src={icons.compass} alt="" />
          <p>Happy orientation week!</p>
        </>
      );

    case 'recess':
      return (
        <>
          <img src={icons.park} alt="" />
          <p>It&apos; recess week!</p>
        </>
      );

    case 'reading':
      return (
        <>
          <img src={icons.books} alt="" />
          <p>Time to study for your exams!</p>
        </>
      );

    default:
      return null;
  }
}

export default function(props: Props) {
  return (
    <section className={styles.day}>
      <header className={styles.header}>
        <h2>
          <div>
            <HeaderDate offset={props.offset}>{props.dates[0]}</HeaderDate>
          </div>
          {props.dates.length > 1 && (
            <>
              <div className={styles.to}> to </div>
              <div>
                <HeaderDate offset={props.offset + props.dates.length - 1}>
                  {last(props.dates)}
                </HeaderDate>
              </div>
            </>
          )}
        </h2>
      </header>
      <div className={styles.emptyGroup}>{renderType(props.type)}</div>
    </section>
  );
}
