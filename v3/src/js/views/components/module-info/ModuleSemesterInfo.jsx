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

    this.state = {
      selected: semesterNames[getFirstAvailableSemester(this.props.semesters)],
    };
  }

  selectSemester(semester: string) {
    this.setState({ selected: semester });
  }

  buttonAttrs(choices: string[]) {
    const availableSems = this.props.semesters
      .map(semesterData => semesterNames[semesterData.Semester]);

    const attrs = {};
    _.difference(choices, availableSems).forEach((disabledChoice) => {
      attrs[disabledChoice] = { disabled: true };
    });

    return { attrs };
  }

  selectedSemester(): ?SemesterData {
    const [selected] = _.entries(semesterNames)
      .find(([, name]) => name === this.state.selected) || [];
    return this.props.semesters
      .find(semesterData => semesterData.Semester === selected);
  }

  render() {
    // Button labels are short semester names
    const choices = _.values(config.shortSemesterNames);

    return (
      <div>
        <ButtonGroupSelector
          {...this.buttonAttrs(choices)}
          size="sm"
          choices={choices}
          selectedChoice={this.state.selected}
          onChoiceSelect={choice => this.selectSemester(choice)}
        />
      </div>
    );
  }
}
