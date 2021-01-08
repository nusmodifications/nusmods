import { FC, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import type { Semester } from 'types/modules';
import styles from './MeetupsHeader.scss'
import TimetableContent from '../timetable/TimetableContent';
import { getSemesterTimetableColors, getSemesterTimetableLessons } from 'selectors/timetables';
import { semesterForMeetupsPage } from 'views/routes/paths'
import { deserializeTimetable } from 'utils/timetables';
import { fillColorMapping } from 'utils/colors';
import deferComponentRender from 'views/hocs/deferComponentRender';

type Params = {
    semester: string;
  };


const MeetupsHeader: FC<{semester : Semester}> = ({ semester }) => {
    return (
        <div className={styles.headerContainer}>
            <span className={styles.headerLabel}>{`Semester ${semester} Meetups`}</span>
        </div>
    );
  };

export const MeetupsContainerComponent: FC = () => {
    const params = useParams<Params>();
    const semester = semesterForMeetupsPage(params.semester);


    const timetable = useSelector(getSemesterTimetableLessons)(semester);
    const colors = useSelector(getSemesterTimetableColors)(semester);

    const [importedTimetable, setImportedTimetable] = useState(() =>
    semester && params.action ? deserializeTimetable(location.search) : null,
  );

    const displayedTimetable = importedTimetable || timetable;
    const filledColors = useMemo(() => fillColorMapping(displayedTimetable, colors), [
        colors,
        displayedTimetable,
      ]);

return (
    <TimetableContent
      key={semester}
      semester={semester}
      timetable={displayedTimetable}
      colors={filledColors}
      header={
          <MeetupsHeader semester={semester}/>
      }
    />
  );
}

export default deferComponentRender(MeetupsContainerComponent); 