/**
 * This file should contain all the things that are needed by the meetups module.
 * For this hackathon, our default state should be nothing selected, hence there
 * shouldn't be a need for any state other than semester to be passed to the
 * module at this stage.
 *
 * More state will come in when we implement save meetup data to local storage.
 */

import { FC, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, useParams, useLocation } from 'react-router-dom';
import type { State } from 'types/state';
import type { Semester } from 'types/modules';
import { getSemesterTimetableColors, getSemesterTimetableLessons } from 'selectors/timetables';
import { fillColorMapping } from 'utils/colors';
import { semesterForMeetupsPage, timetablePage, meetupsPage } from 'views/routes/paths';
import { deserializeTimetable } from './meetups';
import deferComponentRender from 'views/hocs/deferComponentRender';
import MeetupsContent from './MeetupsContent';
import styles from './MeetupsHeader.scss';

type Params = {
  action: string;
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
  const timetable = useSelector(getSemesterTimetableLessons)(semester);
  const colors = useSelector(getSemesterTimetableColors)(semester);
  const location = useLocation();
  const importedTimetable =
    semester && params.action ? deserializeTimetable(location.search) : null;
  const filledColors = useMemo(() => fillColorMapping(timetable, colors), [colors, timetable]);

  // If semester returns null, we'll direct the user to the home page (same as timetable)
  const activeSemester = useSelector(({ app }: State) => app.activeSemester);
  if (semester == null) {
    return <Redirect to={timetablePage(activeSemester)} />;
  }

  return (
    <MeetupsContent
      semester={semester}
      timetable={timetable} // default set to nothing on the meetup table
      colors={filledColors}
      importedTimetable={importedTimetable}
      header={
        <>
          <MeetupsHeader semester={semester} />
        </>
      }
    />
  );
};

export default deferComponentRender(MeetupsContainerComponent);
