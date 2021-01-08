import * as React from 'react';
import classnames from 'classnames';

import ColorPicker from 'views/components/ColorPicker';
import { Eye, EyeOff, Trash, Edit2, Save } from 'react-feather';

import elements from 'views/elements';
import Tooltip from 'views/components/Tooltip';

import styles from './MeetupUsersTable.scss';
import type { User, UserWithIndex, Color } from './meetups';

export type Props = {
  users: User[];
  horizontalOrientation: boolean;
  owner: User; //'Myself' by default
  // isEditing: boolean;

  // Actions
  selectUserColor: (user: UserWithIndex, colorIndex: Color) => void;
  onRemoveUser: (user: UserWithIndex) => void;
  toggleHide: (user: UserWithIndex) => void;
  toggleEdit: (user: UserWithIndex) => void;
  onEditUser: (index: number, name: string) => void;
  // resetTombstone: () => void;
};

const MeetupUsersTableComponent: React.FC<Props> = (props) => {
  const { users, horizontalOrientation, owner } = props;
  const [names, setNames] = React.useState({
    user: owner.name,
    others: users.map(users => users.name)
  });

  React.useEffect(() => {
    setNames(() => ({
      user: owner.name,
      others: users.map(users => users.name)
    }))
  }, [users, owner])

  const handleSaveInput = (user: UserWithIndex, event?: React.FormEvent) => {
    if (event) event.preventDefault();
    if (user.index < 0) {
      props.onEditUser(user.index, names.user)
    } else {
      props.onEditUser(user.index, names.others[user.index])
    }
  }

  const renderModuleActions = (user: UserWithIndex) => {
    const hideBtnLabel = `${user.hiddenInTimetable ? 'Show' : 'Hide'} ${user.name}`;
    const removeBtnLabel = `Remove ${user.name} from timetable`;
    const editBtnLabel = `Edit ${user.name}'s name`;
    return (
      <div className={styles.moduleActionButtons}>
        <div className="btn-group">
          {/* <Tooltip content={editBtnLabel} touch="hold"> */}
          {user.isEditing ? (
            <>
              <button
                type="button"
                className={classnames('btn btn-outline-secondary btn-svg', styles.moduleAction)}
                aria-label={editBtnLabel}
                onClick={() => handleSaveInput(user)}
              >
                <Save className={styles.actionIcon} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={classnames('btn btn-outline-secondary btn-svg', styles.moduleAction)}
                aria-label={editBtnLabel}
                onClick={() => props.toggleEdit(user)}
              >
                <Edit2 className={styles.actionIcon} />
              </button>
            </>
          )}
          {user.index >= 0 && (
            <Tooltip content={removeBtnLabel} touch="hold">
              <button
                type="button"
                className={classnames('btn btn-outline-secondary btn-svg', styles.moduleAction)}
                aria-label={removeBtnLabel}
                onClick={() => props.onRemoveUser(user)}
              >
                <Trash className={styles.actionIcon} />
              </button>
            </Tooltip>
          )}
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

  const handleInputChange = (index: number, value: string) => {
    if (index < 0) {
      setNames((prevState) => ({
        ...prevState,
        user: value
      }))
    } else {
      setNames((prevState) => {
        const others = [... prevState.others]
        others[index] = value;
        return {
          ...prevState,
          others
        }
      })
    }
  }

  const renderInputField = (user: UserWithIndex) => {
    const name = user.index < 0 ? names.user : names.others[user.index]
    return (
      <>
        <form onSubmit={(e) => handleSaveInput(user, e)}>
          <div className={classnames(styles.container)}>
            <input
              className={classnames(styles.input)}
              value={name}
              placeholder={'Name'}
              onChange={(e) => handleInputChange(user.index, e.target.value)}
            />
          </div>
        </form>
      </>
    );
  };

  const renderUser = (user: UserWithIndex) => {
    return (
      <>
        <div className={styles.moduleColor}>
          <ColorPicker
            label={`Change ${user.name} timetable color`}
            color={user.color}
            isHidden={false}
            onChooseColor={(colorIndex: number) => {
              if (colorIndex < 0 || colorIndex > 7)
                throw new Error(`Invalid colorIndex encounteded ${colorIndex}`);
              const color = colorIndex as Color;
              props.selectUserColor(user, color);
            }}
          />
        </div>
        <div className={styles.moduleInfo}>
          <div className={styles.moduleInfoText}>
            {user.isEditing ? renderInputField(user) : user.name}
          </div>
          {renderModuleActions(user)}
        </div>
      </>
    );
  };

  return (
    <div className={classnames(styles.modulesTable, elements.moduleTable, 'row')}>
      <div
          className={classnames(
            styles.modulesTableRow,
            'col-sm-6',
            horizontalOrientation ? 'col-lg-4' : 'col-md-12',
          )}
          key={owner.name}
        >
          {renderUser({ ...owner, index: -1 })}
      </div>
      {users.map((user, index) => (
        <div className={classnames(
            styles.modulesTableRow,
            'col-sm-6',
            horizontalOrientation ? 'col-lg-4' : 'col-md-12',
          )}
          key={index}>
          {renderUser({ ...user, index })}
        </div>))}
    </div>
  );
};

export default MeetupUsersTableComponent;
