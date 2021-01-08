import * as React from 'react';
import classnames from 'classnames';

import { ColorIndex } from 'types/timetables';
import { Semester } from 'types/modules';

import ColorPicker from 'views/components/ColorPicker';
import { Eye, EyeOff, Trash } from 'react-feather';

import elements from 'views/elements';
import Tooltip from 'views/components/Tooltip';

import styles from './MeetupUsersTable.scss';
import type { User, Color } from './meetups';

export type Props = {
    semester: Semester;
    users: User[];
    horizontalOrientation: boolean;
    owner: User; //'Myself' by default

    // Actions
    selectUserColor: (user: User, colorIndex: Color) => void;
    onRemoveUser: (user: User) => void;
    toggleHide: (user: User) => void;
    // resetTombstone: () => void;
};

const MeetupUsersTableComponent: React.FC<Props> = (props) => {

    const {semester, users, horizontalOrientation, owner} = props;

    const renderModuleActions = (user: User) => {
        const hideBtnLabel = `${user.hiddenInTimetable ? 'Show' : 'Hide'} ${user.name}`;
        const removeBtnLabel = `Remove ${user.name} from timetable`;
        return (
          <div className={styles.moduleActionButtons}>
            <div className="btn-group">
                {user!=owner && (<Tooltip content={removeBtnLabel} touch="hold">
                <button
                  type="button"
                  className={classnames('btn btn-outline-secondary btn-svg', styles.moduleAction)}
                  aria-label={removeBtnLabel}
                  onClick={() => props.onRemoveUser(user)}
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
                    props.toggleHide(user);
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
      return (
        <>
          <div className={styles.moduleColor}>
            <ColorPicker
              label={`Change ${user.name} timetable color`}
              color={user.color}
              isHidden={false}
              onChooseColor={(colorIndex: number) => {
                if (colorIndex < 0 || colorIndex > 7) throw new Error(`Invalid colorIndex encounteded ${colorIndex}`)
                const color = colorIndex as Color
                props.selectUserColor(user, color);
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

  export default MeetupUsersTableComponent;
