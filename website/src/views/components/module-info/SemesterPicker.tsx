import * as React from 'react';
import { each } from 'lodash';

import { Semester } from 'types/modules';

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

const SemesterPicker = React.memo<Props>(
  ({ showDisabled = false, useShortNames = false, ...props }) => {
    const semesterNames = () => {
      return useShortNames ? config.shortSemesterNames : config.semesterNames;
    };

    /**
     * Map button labels (semester names) to semesters
     */
    const semesterMap = (): { [key: string]: Semester | null } => {
      const map: { [key: string]: Semester | null } = {};
      const { semesters } = props;

      each(semesterNames(), (name: string, key: string) => {
        const semester = semesters.find((sem) => String(sem) === key);
        if (semester || showDisabled) map[name] = semester || null;
      });

      return map;
    };

    const onSelectSemester = (choice: string) => {
      const chosen = semesterMap()[choice];

      if (chosen) {
        props.onSelectSemester(Number(chosen));
      }
    };

    // Disable and add title for buttons representing semesters that are not available
    const buttonAttrs = () => {
      const semesterMapObtained = semesterMap();
      const attrs: ButtonGroupProps['attrs'] = {};

      each(semesterNames(), (name: string) => {
        if (!semesterMapObtained[name]) {
          attrs[name] = {
            disabled: true,
            title: `This module is not available in ${name}`,
          };
        }
      });

      return { attrs };
    };

    const { size, selectedSemester } = props;
    const semesterMapObtained = semesterMap();
    const selected = selectedSemester ? semesterNames()[selectedSemester] : null;

    return (
      <ButtonGroupSelector
        {...buttonAttrs()}
        size={size}
        choices={Object.keys(semesterMapObtained)}
        selectedChoice={selected}
        onChoiceSelect={onSelectSemester}
      />
    );
  },
);

export default SemesterPicker;
