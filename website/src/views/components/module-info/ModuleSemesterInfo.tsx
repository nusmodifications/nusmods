import { Component } from 'react';

import { ModuleCode, Semester, SemesterDataCondensed } from 'types/modules';

import { getFirstAvailableSemester } from 'utils/modules';
import config from 'config';
import SemesterPicker from './SemesterPicker';
import ModuleExamClash from './ModuleExamClash';
import ModuleExamInfo from './ModuleExamInfo';
import styles from './ModuleSemesterInfo.scss';

type Props = {
  moduleCode: ModuleCode;
  semesters: readonly SemesterDataCondensed[];
};

type State = {
  selected: Semester;
};

export default class ModuleSemesterInfo extends Component<Props, State> {
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

  override render() {
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
              <ModuleExamInfo semesterData={semester} />

              {/* Added because ST2 exams rely on previous AY's data due to
              ModReg R0, which is difficult for us to get, so we show a link instead. */}
              {config.showSt2ExamTimetable && semester.semester === 4 && (
                <>
                  <h4 className={styles.specialTermExam}>
                    AY
                    {config.archiveYears
                      .slice(-1)?.[0]
                      ?.split('/')
                      ?.map((x) => x.substring(2, 4))
                      ?.join('/')}{' '}
                    Exam
                  </h4>
                  <p>
                    Please visit{' '}
                    <a
                      href={config.st2ExamTimetableUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      the exam timetable
                    </a>{' '}
                    instead.
                  </p>
                </>
              )}

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
