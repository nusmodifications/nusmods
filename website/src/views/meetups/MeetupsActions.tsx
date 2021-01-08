import * as React from 'react';
import classnames from 'classnames';
import { Semester } from 'types/modules';
import { SemTimetableConfig } from 'types/timetables';
import { Timetable } from './meetups';
import { DownloadCloud, Edit2, Moon, Save, Sidebar, XSquare } from 'react-feather';
import ShareMeetups from './ShareMeetups';
import ExportMenu from './ExportMenu';

import styles from './MeetupsActions.scss';

type Props = {
  semester: Semester;
  timetable: SemTimetableConfig;
  timetableSlots: Timetable;
  isVerticalOrientation: boolean;
  toggleTimetableOrientation: React.MouseEventHandler<HTMLButtonElement>;

  isEditing: boolean;
  handleToggleEdit: React.MouseEventHandler<HTMLButtonElement>;

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
        onClick={props.handleToggleEdit}
      >
        {props.isEditing ?
          <>
            <Save className={styles.sidebarIcon} />
            Save
          </> :
          <>
            <Edit2 className={styles.sidebarIcon} />
            Edit
          </>}
      </button>
      {props.isEditing && <button
        type="button"
        className={classnames('btn btn-outline-primary btn-svg')}
        onClick={props.handleImportFromTimetable}
      >
        <DownloadCloud className={styles.sidebarIcon} />
        Import from Timetable
      </button>}
      {!props.isEditing && <button
        type="button"
        className={classnames('btn btn-outline-primary btn-svg')}
        onClick={props.handleSwitchView}
      >
        <Moon className={styles.sidebarIcon} />
        Switch View
      </button>}
      {props.isEditing && <button
        type="button"
        className={classnames('btn btn-outline-primary btn-svg')}
        onClick={props.handleReset}
      >
        <XSquare className={styles.sidebarIcon} />
        Reset
      </button>}
    </div>

    <div className={styles.buttonGroup} role="group" aria-label="Timetable exporting">
      {!props.isEditing && <ExportMenu semester={props.semester} timetable={props.timetable} />}

      {!props.isEditing && <ShareMeetups semester={props.semester} timetable={props.timetableSlots} />}
    </div>
  </div>
);

export default MeetupsActions;
