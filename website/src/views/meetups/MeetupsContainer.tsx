/**
 * This file should contain all the things that are needed by the meetups module.
 * For this hackathon, our default state should be nothing selected, hence there
 * shouldn't be a need for any state other than semester to be passed to the
 * module at this stage.
 *
 * More state will come in when we implement save meetup data to local storage.
 */

import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, useParams } from 'react-router-dom';
import type { State } from 'types/state';
import type { Semester } from 'types/modules';
import { semesterForMeetupsPage, timetablePage } from 'views/routes/paths';
import deferComponentRender from 'views/hocs/deferComponentRender';
import MeetupsContent from './MeetupsContent';
import styles from './MeetupsHeader.scss';

type Params = {
  semester: string;
};

const MeetupsHeader: FC<{ semester: Semester }> = ({ semester }) => (
  <div className={styles.headerContainer}>
    <span className={styles.headerLabel}>{`Semester ${semester} Meetups`}</span>
  </div>
);

export const MeetupsContainerComponent: FC = () => {
  const params = useParams<Params>(); // params = "sem-2"
  const semester = semesterForMeetupsPage(params.semester); // semester = 2 <-- Gay function... Why don't just save params.semester as number?

  // If semester returns null, we'll direct the user to the home page (same as timetable)
  const activeSemester = useSelector(({ app }: State) => app.activeSemester);
  if (semester == null) {
    return <Redirect to={timetablePage(activeSemester)} />;
  }

  return (
    <MeetupsContent
      semester={semester}
      timetable={{}} // default set to nothing on the meetup table
      header={<MeetupsHeader semester={semester} />}
    />
  );
};

export default deferComponentRender(MeetupsContainerComponent);
