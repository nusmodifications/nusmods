import * as React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Repeat } from 'react-feather';
import {
  ColorMapping,
  HORIZONTAL,
  VERTICAL,
  ModulesMap,
  TimetableOrientation,
} from 'types/reducers';
import { Semester, ModuleCode } from 'types/modules';
import {
  ColoredLesson,
  Lesson,
  ModifiableLesson,
  TimetableArrangement,
  SemTimetableConfig,
  SemTimetableConfigWithLessons,
} from 'types/timetables';
import {
  arrangeLessonsForWeek,
  hydrateSemTimetableWithLessons,
  timetableLessonsArray,
} from 'utils/timetables';
import Title from 'views/components/Title';
import { State as StoreState } from 'types/state';
import * as Meetups from './meetups';
import MeetupsActions from './MeetupsActions';
import UserMeetupsAdd from './UserMeetupsAdd';
import Timetable from '../timetable/Timetable';
import { meetupsPage } from 'views/routes/paths';
import styles from './MeetupsContent.scss';

import _ from 'lodash';
import MeetupUsersTable from './MeetupUsersTable';
import type { User, UserWithIndex, Color } from './meetups';
import { generateTimetable } from './meetups';

type OwnProps = {
  header: React.ReactNode;
  semester: Semester;
  timetable: SemTimetableConfig;
  colors: ColorMapping;
  importedTimetable: Meetups.Timetable | null;
};

type Props = OwnProps & {
  // From Redux
  modules: ModulesMap;
  timetableWithLessons: SemTimetableConfigWithLessons;
  hiddenInTimetable: ModuleCode[];
};

type State = {
  isScrolledHorizontally: boolean;
  isEditing: boolean;
  isFree: boolean;
  timetableOrientation: TimetableOrientation;
  state: Meetups.State;
};

class MeetupsContent extends React.Component<Props, State> {
  state: State = {
    isScrolledHorizontally: true,
    isEditing: false,
    isFree: false,
    // tombstone: null, // Don't need to implement tombstone for deleted users first
    timetableOrientation: HORIZONTAL,
    state: Meetups.generateState(this.props.importedTimetable),
  };

  toggleTimetableOrientation: React.MouseEventHandler<HTMLButtonElement> = () => {
    this.setState((prevState) => ({
      ...prevState,
      timetableOrientation: prevState.timetableOrientation === HORIZONTAL ? VERTICAL : HORIZONTAL,
    }));
  };

  isHiddenInTimetable = (moduleCode: ModuleCode) =>
    this.props.hiddenInTimetable.includes(moduleCode);

  handleImportFromTimetable: React.MouseEventHandler<HTMLButtonElement> = () => {
    const timetableLessons: Lesson[] = timetableLessonsArray(this.props.timetableWithLessons)
      // Do not process hidden modules
      .filter((lesson) => !this.isHiddenInTimetable(lesson.moduleCode));
    const coloredTimetableLessons = timetableLessons.map(
      (lesson: Lesson): ColoredLesson => ({
        ...lesson,
        colorIndex: this.props.colors[lesson.moduleCode],
      }),
    );
    const arrangedLessons = arrangeLessonsForWeek(coloredTimetableLessons);
    this.setState((state) => ({
      ...state,
      state: Meetups.handleImportFromTimetable(arrangedLessons)(state.state),
    }));
  };

  handleToggleEdit: React.MouseEventHandler<HTMLButtonElement> = () => {
    this.setState((prevState) => ({
      ...prevState,
      isEditing: !prevState.isEditing,
    }));
  };

  handleSwitchView: React.MouseEventHandler<HTMLButtonElement> = () => {
    this.setState((prevState) => ({
      ...prevState,
      isFree: !prevState.isFree,
    }));
  };

  handleReset: React.MouseEventHandler<HTMLButtonElement> = () => {
    this.setState((prevState) => ({
      ...prevState,
      state: {
        ...prevState.state,
        user: {
          ...prevState.state.user,
          timetable: generateTimetable(),
        },
      },
    }));
  };

  getLessons = (): TimetableArrangement => {
    if (this.state.isEditing) {
      return Meetups.convertUserToIsModifiableLessons(
        this.state.state.user,
        this.state.state.user.color,
      );
    } else if (this.state.isFree) {
      return Meetups.switchViewToFree(this.state.state.user, this.state.state.others);
    } else {
      const unhiddenOthers = this.state.state.others.filter((user) => !user.hiddenInTimetable); // To filter out hidden users in others
      const hideAdjustUser = this.state.state.user.hiddenInTimetable
        ? {
            ...this.state.state.user,
            timetable: generateTimetable(),
          }
        : this.state.state.user; // Test if 'Myself' is hidden, code quality can be improved
      const userLessons = Meetups.mapUserToTimetableArrangement(hideAdjustUser);
      const othersLessons = unhiddenOthers.map(Meetups.mapUserToTimetableArrangement);
      const allLessons = Meetups.combineTimetableArrangements(userLessons, othersLessons);
      return _.mapValues(allLessons, (value) =>
        value.filter((modifiableLessons) => modifiableLessons.length > 0),
      );
    }
  };

  handleAddTimetableCell = (lesson: ModifiableLesson) => {
    this.setState((prevState) => ({
      ...prevState,
      state: Meetups.handleAddTimetableCell(lesson.lessonType, lesson.classNo)(prevState.state),
    }));
  };

  handleAddUser = (user: Meetups.User) => {
    this.setState({
      state: { ...this.state.state, others: [...this.state.state.others, user] },
    });
  };

  toggleColor = (user: User, color: Color): User => {
    return { ...user, color: color };
  };

  selectUserColor = (userToChange: UserWithIndex, color: Color) => {
    if (userToChange.index < 0) {
      this.setState((state) => ({
        ...state,
        state: {
          ...state.state,
          user: {
            ...state.state.user,
            color: color,
          },
        },
      }));
    } else {
      const newState = this.state.state.others.map((user, index) =>
      index === userToChange.index ? this.toggleColor(user, color) : user,
      );
      this.setState((state) => ({
        ...state,
        state: {
          ...state.state,
          others: newState,
        },
      }));
    }
  };

  removeUser = (userToRemove: UserWithIndex) => {
    const newState = this.state.state.others.filter((user, index) => index != userToRemove.index);
    this.setState((prevstate) => ({
      ...prevstate,
      state: {
        ...prevstate.state,
        others: newState,
      },
    }));
  };

  toggleHide = (user: User): User => {
    const isHiddenUser = user.hiddenInTimetable;
    return { ...user, hiddenInTimetable: !isHiddenUser };
  };

  toggleHideUser = (userToToggle: UserWithIndex) => {
    if (userToToggle.index < 0) {
      const isHiddenUser = this.state.state.user.hiddenInTimetable;
      this.setState((state) => ({
        ...state,
        state: {
          ...state.state,
          user: {
            ...state.state.user,
            hiddenInTimetable: !isHiddenUser,
          },
        },
      }));
    } else {
      const newState = this.state.state.others.map((user, index) =>
        index === userToToggle.index ? this.toggleHide(user) : user,
      );
      this.setState((state) => ({
        ...state,
        state: {
          ...state.state,
          others: newState,
        },
      }));
    }
  };

  switchUserEdit = (user: User): User => {
    const isEditUser = user.isEditing;
    return { ...user, isEditing: !isEditUser };
  };

  toggleUserEdit = (userToToggle: UserWithIndex) => {
    if (userToToggle.index < 0) {
      const isEditingUser = this.state.state.user.isEditing;
      this.setState((state) => ({
        ...state,
        state: {
          ...state.state,
          user: {
            ...state.state.user,
            isEditing: !isEditingUser,
          },
        },
      }));
    } else {
      const newState = this.state.state.others.map((user, index) =>
        index === userToToggle.index ? this.switchUserEdit(user) : user,
      );
      this.setState((state) => ({
        ...state,
        state: {
          ...state.state,
          others: newState,
        },
      }));
    }
  };

  onUserEdit = (index: number, name: string) => {
    if (index < 0) {
      this.setState((state) => ({
        ...state,
        state: {
          ...state.state,
          user: {
            ...state.state.user,
            name: name,
            isEditing: false,
          },
        },
      }));
    } else {
      const newState = this.state.state.others.map((user, userIndex) =>
      userIndex == index ? { ...user, name: name, isEditing: false } : user,
      );
      this.setState((state) => ({
        ...state,
        state: {
          ...state.state,
          others: newState,
        },
      }));
    }
  };


  // Returns component with table(s) of users
  renderUserSections(users: User[], horizontalOrientation: boolean) {
    return (
      <MeetupUsersTable
        users={users}
        horizontalOrientation={horizontalOrientation}
        owner={this.state.state.user}
        onRemoveUser={this.removeUser}
        toggleHide={this.toggleHideUser}
        toggleEdit={this.toggleUserEdit}
        onEditUser={this.onUserEdit}
        selectUserColor={this.selectUserColor}
      />
    );
  }

  render() {
    const { semester } = this.props;

    const isVerticalOrientation = this.state.timetableOrientation !== HORIZONTAL;

    const lessons = this.getLessons();

    return (
      <div
        className={classnames('page-container', styles.container, {
          verticalMode: isVerticalOrientation,
        })}
      >
        <Title>Meetups</Title>

        <div>
          {this.props.header}
        </div>

        <div className="row">
          <div
            className={classnames({
              'col-md-12': !isVerticalOrientation,
              'col-md-8': isVerticalOrientation,
            })}
          >
            <div className={styles.timetableWrapper}>
              <Timetable
                // Need to convert our data structure into lessons for timetable to render
                // Note: Must include saturday: [] and sunday: [] for timetable to render saturday and sunday
                lessons={lessons}
                isVerticalOrientation={isVerticalOrientation}
                isScrolledHorizontally={this.state.isScrolledHorizontally}
                onModifyCell={this.handleAddTimetableCell}
              />
            </div>
          </div>
          <div
            className={classnames({
              'col-md-12': !isVerticalOrientation,
              'col-md-4': isVerticalOrientation,
            })}
          >
            <div className="row">
              <div className="col-12 no-export">
                <MeetupsActions
                  isVerticalOrientation={isVerticalOrientation}
                  semester={semester}
                  timetable={this.props.timetable}
                  timetableSlots={this.state.state.user.timetable}
                  // TO DO: Add the implementation of the functions for the following:
                  toggleTimetableOrientation={this.toggleTimetableOrientation}
                  isEditing={this.state.isEditing}
                  handleToggleEdit={this.handleToggleEdit}
                  isFree={this.state.isFree}
                  handleImportFromTimetable={this.handleImportFromTimetable}
                  // eslint-disable-next-line no-console
                  handleSwitchView={this.handleSwitchView}
                  // eslint-disable-next-line no-console
                  handleReset={this.handleReset}
                />
              </div>

              <div className={classnames(styles.userMeetupAdd)}>
                <UserMeetupsAdd
                  addUser={this.handleAddUser}
                  userNum={this.state.state.others.length + 1}
                />
              </div>

              <div className="col-12">
                {this.renderUserSections(this.state.state.others, !isVerticalOrientation)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: StoreState, ownProps: OwnProps) {
  const { semester, timetable } = ownProps;
  const { modules } = state.moduleBank;
  const timetableWithLessons = hydrateSemTimetableWithLessons(timetable, modules, semester);
  const hiddenInTimetable = state.timetables.hidden[semester] || [];

  return {
    semester,
    timetable,
    modules,
    timetableWithLessons,
    hiddenInTimetable,
    // Use local state with default horizontal first
    // timetableOrientation: state.theme.timetableOrientation,
  };
}

export default connect(mapStateToProps, {
  // undo,
})(MeetupsContent);
