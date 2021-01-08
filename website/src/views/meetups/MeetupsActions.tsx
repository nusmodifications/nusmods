import * as React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { toggleTimetableOrientation, toggleTitleDisplay } from 'actions/theme';
import { Semester } from 'types/modules';
import { SemTimetableConfig } from 'types/timetables';

import { DownloadCloud, Sidebar, XSquare } from 'react-feather';
import ShareTimetable from '../timetable/ShareTimetable';
// import ExportMenu from '../timetable/ExportMenu';

import styles from './MeetupsActions.scss';

type Props = {
  semester: Semester;
  timetable: SemTimetableConfig;

  isVerticalOrientation: boolean;
  toggleTimetableOrientation: () => void;

  // TO DO: Add function to toggle switch view and boolean if needed

  handleImportFromTimetable: () => void;
  handleReset: () => void;
};

const MeetupsActions: React.FC<Props> = (props) => (
  <div
    className="btn-toolbar justify-content-between"
    role="toolbar"
    aria-label="Timetable utilities"
  >
    <div className={styles.buttonGroup} role="group" aria-label="Timetable manipulation">
      <button
        type="button"
        className={classnames('btn btn-outline-primary btn-svg')}
        onClick={props.toggleTimetableOrientation}
      >
        <Sidebar className={styles.sidebarIcon} />
        {props.isVerticalOrientation ? 'Horizontal Mode' : 'Vertical Mode'}
      </button>
      <button
        type="button"
        className={classnames('btn btn-outline-primary btn-svg')}
        onClick={props.handleImportFromTimetable}
      >
        <DownloadCloud className={styles.sidebarIcon} />
        Import from Timetable
      </button>
      <button
        type="button"
        className={classnames('btn btn-outline-primary btn-svg')}
        // onClick={}
      >
        {/* I forgot what this button does so someone add an icon here */}
        Switch View
      </button>
      <button
        type="button"
        className={classnames('btn btn-outline-primary btn-svg')}
        onClick={props.handleReset}
      >
        <XSquare className={styles.sidebarIcon} />
        Reset
      </button>
    </div>

    <div className={styles.buttonGroup} role="group" aria-label="Timetable exporting">
      {/* The component below is used to download timetable. We will integrate this function if we have time to. */}
      {/* <ExportMenu semester={props.semester} timetable={props.timetable} /> */}

      <ShareTimetable semester={props.semester} timetable={props.timetable} />
    </div>
  </div>
);

export default connect(null, {
  toggleTimetableOrientation,
  toggleTitleDisplay,
})(MeetupsActions);
