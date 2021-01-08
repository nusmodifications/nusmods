import * as React from 'react';
import classnames from 'classnames';
import { Semester } from 'types/modules';
import { SemTimetableConfig } from 'types/timetables';

import { DownloadCloud, Moon, Sidebar, XSquare } from 'react-feather';
import ShareTimetable from './ShareTimetable';
import ExportMenu from './ExportMenu';

import styles from './MeetupsActions.scss';

type Props = {
  semester: Semester;
  timetable: SemTimetableConfig;

  isVerticalOrientation: boolean;
  toggleTimetableOrientation: React.MouseEventHandler<HTMLButtonElement>;

  handleSwitchView: React.MouseEventHandler<HTMLButtonElement>;
  handleImportFromTimetable: React.MouseEventHandler<HTMLButtonElement>;
  handleReset: React.MouseEventHandler<HTMLButtonElement>;
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
        onClick={props.handleSwitchView}
      >
        <Moon className={styles.sidebarIcon} />
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
      <ExportMenu semester={props.semester} timetable={props.timetable} />

      <ShareTimetable semester={props.semester} timetable={props.timetable} />
    </div>
  </div>
);

export default MeetupsActions;
