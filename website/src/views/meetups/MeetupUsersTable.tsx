import * as React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import { ColorIndex } from 'types/timetables';
import { ModuleCode, Semester } from 'types/modules';
import { State as StoreState } from 'types/state';

import ColorPicker from 'views/components/ColorPicker';
import { Eye, EyeOff, Trash } from 'react-feather';
import {
  hideLessonInTimetable,
  selectModuleColor,
  showLessonInTimetable,
} from 'actions/timetables';
import elements from 'views/elements';
import Tooltip from 'views/components/Tooltip';

import styles from './MeetupUsersTable.scss';
import type { User } from './meetups';

export type Props = {
    semester: Semester;
    users: User[];
    horizontalOrientation: boolean;
    username: string; //'Myself' by default

    // Actions
    selectModuleColor: (semester: Semester, moduleCode: ModuleCode, colorIndex: ColorIndex) => void;
    hideLessonInTimetable: (semester: Semester, name: string) => void;
    showLessonInTimetable: (semester: Semester, name: string) => void;
    onRemoveModule: (name: string) => void;
    toggleHide: (name: string) => void;
    // resetTombstone: () => void;
};

export const TimetableModulesTableComponent: React.FC<Props> = (props) => {

    const {semester, users, horizontalOrientation, username} = props;

    const renderModuleActions = (user: User) => {
        const hideBtnLabel = `${user.hiddenInTimetable ? 'Show' : 'Hide'} ${user.name}`;
        const removeBtnLabel = `Remove ${user.name} from timetable`;
        return (
          <div className={styles.moduleActionButtons}>
            <div className="btn-group">
                {!user.name.match(username) && (<Tooltip content={removeBtnLabel} touch="hold">
                <button
                  type="button"
                  className={classnames('btn btn-outline-secondary btn-svg', styles.moduleAction)}
                  aria-label={removeBtnLabel}
                  onClick={() => props.onRemoveModule(user.name)}
                >
                  <Trash className={styles.actionIcon} />
                </button>
              </Tooltip>)}
              <Tooltip content={hideBtnLabel} touch="hold">
                <button
                  type="button"
                  className={classnames('btn btn-outline-secondary btn-svg', styles.moduleAction)}
                  aria-label={hideBtnLabel}
                  onClick={() => {
                    if (user.hiddenInTimetable) {
                      props.toggleHide(user.name);
                    } else {
                      props.toggleHide(user.name);
                    }
                  }}
                >
                  {user.hiddenInTimetable ? (
                    <Eye className={styles.actionIcon} />
                  ) : (
                    <EyeOff className={styles.actionIcon} />
                  )}
                </button>
              </Tooltip>
            </div>
          </div>
        );
      };

    const renderUser = (user: User) => {
      // Second row of text consists of the exam date and the MCs
      return (
        <>
          <div className={styles.moduleColor}>
            <ColorPicker
              label={`Change ${user.name} timetable color`}
              color={user.color}
              isHidden={false}
              onChooseColor={(colorIndex: ColorIndex) => {
                props.selectModuleColor(semester, user.name, colorIndex);
              }}
            />
          </div>
          <div className={styles.moduleInfo}>
            {renderModuleActions(user)}
            {user.name}
          </div>
        </>
      );
    };

    return (
      <div className={classnames(styles.modulesTable, elements.moduleTable, 'row')}>
        {users.map((user) => (
          <div
            className={classnames(
              styles.modulesTableRow,
              'col-sm-6',
              horizontalOrientation ? 'col-lg-4' : 'col-md-12',
            )}
            key={user.name}
          >
            {renderUser(user)}
          </div>
        ))}
      </div>
    );
  };

  export default connect(
    (state: StoreState) => ({ moduleTableOrder: state.settings.moduleTableOrder }),
    {
      selectModuleColor,
      hideLessonInTimetable,
      showLessonInTimetable,
    },
  )(React.memo(TimetableModulesTableComponent));
