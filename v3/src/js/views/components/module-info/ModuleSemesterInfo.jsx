// @flow

import React from 'react';
import _ from 'lodash';
import config from 'config';
import type { SemesterData } from 'types/modules';
import { getFirstAvailableSemester } from 'utils/modules';
import ButtonGroupSelector from 'views/components/ButtonGroupSelector';

const semesterNames = config.shortSemesterNames;

type Props = {
  semesters: SemesterData[],
};

export default class ModuleSemesterInfo extends React.Component {
  props: Props;

  state: {
    selected: string,
  };

  constructor(props: Props) {
    super(props);

    const selectedSem = getFirstAvailableSemester(this.props.semesters);
    this.state = {
      selected: semesterNames[selectedSem],
    };
  }

  semesterMap(): { [string]: ?SemesterData } {
    const map = {};
    const { semesters } = this.props;

    _.each(semesterNames, (name: string, semester: string) => {
      map[name] = semesters.find(data => String(data.Semester) === semester);
    });

    return map;
  }

  selectSemester(selected: string) {
    this.setState({ selected });
  }

  buttonAttrs() {
    const semesterMap = this.semesterMap();
    const attrs = {};
    _.each(semesterNames, (name: string) => {
      if (!semesterMap[name]) attrs[name] = { disabled: true };
    });

    return { attrs };
  }

  render() {
    const { selected } = this.state;
    const semesterMap = this.semesterMap();
    const selectedSemester = semesterMap[selected];

    return (
      <div className="module-semester-container">
        <ButtonGroupSelector
          {...this.buttonAttrs()}
          size="sm"
          choices={Object.keys(semesterMap)}
          selectedChoice={selected}
          onChoiceSelect={choice => this.selectSemester(choice)}
        />
        {selectedSemester && (<div className="module-semester-info">
          { selectedSemester.ExamDate }
          { selectedSemester.LecturePeriods }
          { selectedSemester.TutorialPeriods }
        </div>)}
      </div>
    );
  }
}
