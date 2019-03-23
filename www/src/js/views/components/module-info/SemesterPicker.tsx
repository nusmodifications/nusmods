import * as React from 'react';
import { each } from 'lodash';

import { Semester } from 'types/modulesBase';

import ButtonGroupSelector, {
  Props as ButtonGroupProps,
} from 'views/components/ButtonGroupSelector';
import config from 'config';

type Props = {
  semesters: Semester[];
  showDisabled?: boolean;
  useShortNames?: boolean;
  size?: string;

  selectedSemester: Semester | null;
  onSelectSemester: (semester: Semester) => void;
};

export default class SemesterPicker extends React.PureComponent<Props> {
  static defaultProps = {
    showDisabled: false,
    useShortNames: false,
  };

  onSelectSemester = (choice: string) => {
    const chosen = this.semesterMap()[choice];

    if (chosen) {
      this.props.onSelectSemester(Number(chosen));
    }
  };

  /**
   * Map button labels (semester names) to semesters
   */
  semesterMap(): { [key: string]: Semester | null } {
    const map: { [key: string]: Semester | null } = {};
    const { semesters, showDisabled } = this.props;

    each(this.semesterNames(), (name: string, key: string) => {
      const semester = semesters.find((sem) => String(sem) === key);
      if (semester || showDisabled) map[name] = semester || null;
    });

    return map;
  }

  // Disable and add title for buttons representing semesters that are not available
  buttonAttrs() {
    const semesterMap = this.semesterMap();
    const attrs: ButtonGroupProps['attrs'] = {};

    each(this.semesterNames(), (name: string) => {
      if (!semesterMap[name]) {
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
