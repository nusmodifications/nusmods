import * as React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { HORIZONTAL, ModulesMap, TimetableOrientation } from 'types/reducers';
import { Semester } from 'types/modules';
import { SemTimetableConfig } from 'types/timetables';
import Title from 'views/components/Title';
import { State as StoreState } from 'types/state';
import MeetupsActions from './MeetupsActions';
import Timetable from '../timetable/Timetable';
import styles from './MeetupsContent.scss';

type OwnProps = {
  header: React.ReactNode;
  semester: Semester;
  timetable: SemTimetableConfig;
};

type Props = OwnProps & {
  // From Redux
  modules: ModulesMap;
  // timetableOrientation: TimetableOrientation;

  // Actions
  undo: () => void;
};

type State = {
  isScrolledHorizontally: boolean;
  // tombstone: TombstoneModule | null;
  timetableOrientation: TimetableOrientation;
};

class MeetupsContent extends React.Component<Props, State> {
  state: State = {
    isScrolledHorizontally: false,
    // tombstone: null, // Don't need to implement tombstone for deleted users first
    timetableOrientation: HORIZONTAL,
  };

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
                lessons={{}}
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
                  handleImportFromTimetable={() => console.log("import from timetable")}
                  handleReset={() => console.log("reset")}
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

  return {
    semester,
    timetable,
    modules,
    // Use local state with default horizontal first
    // timetableOrientation: state.theme.timetableOrientation,
  };
}

export default connect(mapStateToProps, {
  // undo,
})(MeetupsContent);
