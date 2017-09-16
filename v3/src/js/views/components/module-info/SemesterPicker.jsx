// @flow

import React, { PureComponent } from 'react';
import _ from 'lodash';

import type { Semester, SemesterData } from 'types/modules';

import config from 'config';
import ButtonGroupSelector from 'views/components/ButtonGroupSelector';

type Props = {
  semesters: SemesterData[],
  showDisabled?: boolean,
  useShortNames?: boolean,
  size?: string,

  selectedSemester: ?Semester,
  onSelectSemester: (semester?: Semester, semesterData?: SemesterData) => void,
};

export default class SemesterPicker extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    showDisabled: false,
    useShortNames: false,
  };

  onSelectSemester = (choice: string) => {
    const chosen = this.semesterMap()[choice];

    if (chosen) {
      // This makes Flow happy
      const semester = Number(chosen.semester);
      if (semester === 1 || semester === 2 || semester === 3 || semester === 4) {
        this.props.onSelectSemester(semester, chosen.semesterData);
      }
    } else {
      this.props.onSelectSemester();
    }
  };

  /**
   * Map button labels (semester names) to semester data
   * @returns {{}}
   */
  semesterMap(): { [string]: ?{ semester: Semester, semesterData: SemesterData } } {
    const map = {};
    const { semesters, showDisabled } = this.props;

    _.each(this.semesterNames(), (name: string, semester: string) => {
      const semesterData = semesters.find(data => String(data.Semester) === semester);
      if (semesterData || showDisabled) {
        map[name] = { semester, semesterData };
      }
    });

    return map;
  }

  // Disable and add title for buttons representing semesters that are not available
  buttonAttrs() {
    const semesterMap = this.semesterMap();
    const attrs = {};

    _.each(this.semesterNames(), (name: string) => {
      if (!_.get(semesterMap, [name, 'semesterData'])) {
        attrs[name] = {
          disabled: true,
          title: `This module is not available in ${name}`,
        };
      }
    });

    return { attrs };
  }

  semesterNames() {
    return this.props.useShortNames ? config.shortSemesterNames : config.semesterNames;
  }

  render() {
    const { size, selectedSemester } = this.props;
    const semesterMap = this.semesterMap();
    const selected = selectedSemester ? this.semesterNames()[selectedSemester] : null;

    return (
      <ButtonGroupSelector
        {...this.buttonAttrs()}
        size={size}
        choices={Object.keys(semesterMap)}
        selectedChoice={selected}
        onChoiceSelect={this.onSelectSemester}
      />
    );
  }
}
