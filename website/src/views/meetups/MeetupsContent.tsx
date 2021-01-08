import * as React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { ColorMapping, HORIZONTAL, VERTICAL, ModulesMap, TimetableOrientation } from 'types/reducers';
import { Semester, ModuleCode } from 'types/modules';
import { ColoredLesson, Lesson, SemTimetableConfig, SemTimetableConfigWithLessons } from 'types/timetables';
import { arrangeLessonsForWeek, hydrateSemTimetableWithLessons, timetableLessonsArray } from 'utils/timetables';
import Title from 'views/components/Title';
import { State as StoreState } from 'types/state';
import * as Meetups from './meetups';
import MeetupsActions from './MeetupsActions';
import Timetable from '../timetable/Timetable';
import styles from './MeetupsContent.scss';

type OwnProps = {
  header: React.ReactNode;
  semester: Semester;
  timetable: SemTimetableConfig;
  colors: ColorMapping;
};

type Props = OwnProps & {
  // From Redux
  modules: ModulesMap;
  timetableWithLessons: SemTimetableConfigWithLessons;
  hiddenInTimetable: ModuleCode[];
  // timetableOrientation: TimetableOrientation;

  // Actions
  // undo: () => void;
};

type State = {
  isScrolledHorizontally: boolean;
  // tombstone: TombstoneModule | null;
  timetableOrientation: TimetableOrientation;
  state: Meetups.State;
};

class MeetupsContent extends React.Component<Props, State> {
  state: State = {
    isScrolledHorizontally: false,
    // tombstone: null, // Don't need to implement tombstone for deleted users first
    timetableOrientation: HORIZONTAL,
    state: Meetups.generateState(),
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
        state: Meetups.handleImportFromTimetable(arrangedLessons)(state.state)
      }))
  }

  // Dont need to implement tombstone for deleted users first...
  // resetTombstone = () => this.setState({ tombstone: null });

  // Returns component with table(s) of users
  // eslint-disable-next-line class-methods-use-this
  renderUserSections() {
    return <>Go look at renderModuleSections of TimetableContent.tsx</>;
  }

  render() {
    const { semester } = this.props;

    const isVerticalOrientation = this.state.timetableOrientation !== HORIZONTAL;

    const userLessons = Meetups.mapUserToTimetableArrangement(this.state.state.user)
    const othersLessons = this.state.state.others.map(Meetups.mapUserToTimetableArrangement)
    const lessons = Meetups.combineTimetableArrangements(userLessons, othersLessons)

    return (
      <div
        className={classnames('page-container', styles.container, {
          verticalMode: isVerticalOrientation,
        })}
      >
        <Title>Meetups</Title>

        <div>{this.props.header}</div>

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
                  // TO DO: Add the implementation of the functions for the following:
                  toggleTimetableOrientation={this.toggleTimetableOrientation}
                  // eslint-disable-next-line no-console
                  handleSwitchView={() => console.log('switch view')}
                  handleImportFromTimetable={this.handleImportFromTimetable}
                  // eslint-disable-next-line no-console
                  handleReset={() => console.log('reset')}
                />
              </div>

              <div className={styles.modulesSelect}>Look at ModulesSelectContainer component</div>

              <div className="col-12">{this.renderUserSections()}</div>
              <div className="col-12">Look at ModulesTableFooter component</div>
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
