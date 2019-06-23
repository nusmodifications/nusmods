import * as React from 'react';

import { ModuleCode, Semester, SemesterDataCondensed } from 'types/modules';

import { formatExamDate, getFirstAvailableSemester } from 'utils/modules';
import { BULLET } from 'utils/react';
import SemesterPicker from './SemesterPicker';
import ModuleExamClash from './ModuleExamClash';
import styles from './ModuleSemesterInfo.scss';

type Props = {
  moduleCode: ModuleCode;
  semesters: readonly SemesterDataCondensed[];
};

type State = {
  selected: Semester;
};

export default class ModuleSemesterInfo extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { selected: getFirstAvailableSemester(this.props.semesters) };
  }

  onSelectSemester = (selected: Semester | null) => {
    if (selected) {
      this.setState({ selected });
    }
  };

  selectedSemester(): SemesterDataCondensed | undefined {
    return this.props.semesters.find((data) => data.semester === this.state.selected);
  }

  render() {
    const semester = this.selectedSemester();
    const semesters = this.props.semesters.map((data) => data.semester);

    return (
      <div className={styles.moduleSemesterContainer}>
        <SemesterPicker
          semesters={semesters}
          selectedSemester={this.state.selected}
          size="sm"
          onSelectSemester={this.onSelectSemester}
          useShortNames
          showDisabled
        />

        {semester && (
          <>
            <section className={styles.moduleExam}>
              <h4>Exam</h4>
              <p>
                {formatExamDate(semester.examDate)}{' '}
                {semester.examDuration && `${BULLET} ${semester.examDuration / 60} hrs`}
              </p>

              <ModuleExamClash
                semester={semester.semester}
                examDate={semester.examDate}
                moduleCode={this.props.moduleCode}
              />
            </section>
          </>
        )}
      </div>
    );
  }
}
