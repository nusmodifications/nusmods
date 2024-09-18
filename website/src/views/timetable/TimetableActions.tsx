import * as React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { Calendar, Grid, Sidebar, Type } from 'react-feather';
import { toggleTimetableOrientation, toggleTitleDisplay } from 'actions/theme';
import { ModuleCode, Semester } from 'types/modules';
import { CustomModuleLessonData } from 'types/reducers';
import { Lesson, SemTimetableConfig } from 'types/timetables';

import elements from 'views/elements';
import config from 'config';
import ResetTimetable from './ResetTimetable';
import ShareTimetable from './ShareTimetable';
import ExportMenu from './ExportMenu';

import styles from './TimetableActions.scss';
import CustomModuleSelect from './CustomModuleSelect';

type Props = {
  semester: Semester;
  timetable: SemTimetableConfig;

  isVerticalOrientation: boolean;
  toggleTimetableOrientation: () => void;

  showTitle: boolean;
  toggleTitleDisplay: () => void;

  showExamCalendar: boolean;
  toggleExamCalendar: () => void;

  hiddenModules: ModuleCode[];
  customModules: CustomModuleLessonData;

  addCustomModule: (moduleCode: ModuleCode, lesson: Lesson) => void;

  resetTimetable: () => void;
};

const TimetableActions: React.FC<Props> = (props) => (
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
        disabled={props.showExamCalendar}
      >
        <Sidebar className={styles.sidebarIcon} />
        {props.isVerticalOrientation ? 'Horizontal Mode' : 'Vertical Mode'}
      </button>

      {!props.isVerticalOrientation && (
        <button
          type="button"
          className={classnames(styles.titleBtn, 'btn-outline-primary btn btn-svg')}
          onClick={props.toggleTitleDisplay}
          disabled={props.showExamCalendar}
        >
          <Type className={styles.titleIcon} />
          {props.showTitle ? 'Hide Titles' : 'Show Titles'}
        </button>
      )}

      {config.examAvailabilitySet.has(props.semester) && (
        <button
          type="button"
          className={classnames(
            styles.calendarBtn,
            elements.examCalendarBtn,
            'btn-outline-primary btn btn-svg',
          )}
          onClick={props.toggleExamCalendar}
        >
          {props.showExamCalendar ? (
            <>
              <Grid className="svg svg-small" /> Timetable
            </>
          ) : (
            <>
              <Calendar className="svg svg-small" /> Exam Calendar
            </>
          )}
        </button>
      )}
    </div>

    <div className={styles.buttonGroup} role="group" aria-label="Timetable exporting">
      <ExportMenu semester={props.semester} timetable={props.timetable} />
      <ShareTimetable
        semester={props.semester}
        timetable={props.timetable}
        hiddenModules={props.hiddenModules}
        customModules={props.customModules}
      />
      <CustomModuleSelect addCustomModule={props.addCustomModule} semester={props.semester} />
      <ResetTimetable resetTimetable={props.resetTimetable} />
    </div>
  </div>
);

export default connect(null, {
  toggleTimetableOrientation,
  toggleTitleDisplay,
})(TimetableActions);
