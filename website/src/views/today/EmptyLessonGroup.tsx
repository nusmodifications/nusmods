import * as React from 'react';
import { EmptyGroupType } from 'types/views';

import BeachIcon from 'img/icons/beach.svg';
import BooksIcon from 'img/icons/books.svg';
import CompassIcon from 'img/icons/compass.svg';
import ConfettiIcon from 'img/icons/confetti.svg';
import ParkIcon from 'img/icons/park.svg';
import WinterIcon from 'img/icons/winter.svg';

import styles from './EmptyLessonGroup.scss';

type Props = {
  type: EmptyGroupType;
};

function renderType(type: EmptyGroupType) {
  switch (type) {
    case 'winter':
      return (
        <>
          <WinterIcon />
          <p>Enjoy your winter break!</p>
        </>
      );

    case 'summer':
      return (
        <>
          <BeachIcon />
          <p>Enjoy your summer break!</p>
        </>
      );

    case 'holiday':
      return (
        <>
          <ConfettiIcon />
          <p>Happy holiday!</p>
        </>
      );

    case 'weekend':
      return (
        <>
          <BooksIcon />
          <p>It&apos;s the weekend!</p>
        </>
      );

    case 'orientation':
      return (
        <>
          <CompassIcon />
          <p>Happy orientation week!</p>
        </>
      );

    case 'recess':
      return (
        <>
          <ParkIcon />
          <p>It&apos;s recess week!</p>
        </>
      );

    case 'reading':
      return (
        <>
          <BooksIcon />
          <p>Time to study for your exams!</p>
        </>
      );

    default:
      return null;
  }
}

const EmptyLessonGroup: React.FC<Props> = ({ type }) => (
  <div className={styles.emptyGroup}>{renderType(type)}</div>
);

export default EmptyLessonGroup;
