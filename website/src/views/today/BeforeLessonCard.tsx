import * as React from 'react';

import classnames from 'classnames';
import { Link } from 'react-router-dom';

import { differenceInHours, formatDistanceStrict } from 'date-fns';
import { Lesson } from 'types/timetables';
import { getStartTimeAsDate } from 'utils/timetables';
import { venuePage } from 'views/routes/paths';
import styles from './BeforeLessonCard.scss';
import cardStyles from './DayEvents.scss';

type Props = {
  currentTime: Date;
  nextLesson: Lesson;
  marker: React.ReactNode;
};

const freeRoomMessage = (
  <>
    Need help finding a free classroom to study in? Check out our{' '}
    <Link to={venuePage()}>free room finder</Link>.
  </>
);

const BeforeLessonCard: React.FC<Props> = (props) => {
  const { nextLesson, currentTime, marker } = props;
  // `currentTime` is the current instant expressed on Singapore time (see
  // TodayContainer). Anchoring the lesson's start time to the same reference
  // means the difference below reflects the real duration until the lesson,
  // regardless of the viewer's local timezone.
  const nextLessonDate = getStartTimeAsDate(nextLesson, currentTime);
  const hoursTillNextLesson = differenceInHours(nextLessonDate, currentTime);

  let comment = null;

  const currentHour = currentTime.getHours();
  if (hoursTillNextLesson < 1) {
    comment = <p>Better get a move on to your next class! {freeRoomMessage}</p>;
  } else if (currentHour < 7 || currentHour >= 22) {
    // Why are you up right now?
    comment = <p>Why not go get some sleep?</p>;
  } else {
    comment = <p>Remember to take breaks when studying. {freeRoomMessage}</p>;
  }

  return (
    <div className={cardStyles.lesson}>
      <div className={cardStyles.lessonTime}>
        <p />
        {marker}
        <p />
      </div>
      <div className={classnames(cardStyles.card, styles.inBetweenClass)}>
        <p>
          You have <strong>{formatDistanceStrict(nextLessonDate, currentTime)}</strong> till the
          next class.
        </p>
        {comment}
      </div>
    </div>
  );
};

export default BeforeLessonCard;
