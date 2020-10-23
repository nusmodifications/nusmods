import React, { useEffect, useMemo, useRef } from 'react';
import { connect } from 'react-redux';
import Downshift from 'downshift';
import classnames from 'classnames';

import { State } from 'types/state';

import { ModuleCode, ModuleCondensed, Semester } from 'types/modules';
import { createSearchPredicate } from 'utils/moduleSearch';
import { takeUntil } from 'utils/array';

import styles from './PlannerModuleSelect.scss';

type Props = Readonly<{
  // Input props
  id?: string;
  className?: string;
  rows: number;
  defaultValue?: string;

  // For filtering
  onSelect: (module: ModuleCondensed | null) => void;
  onCancel?: () => void;
  onBlur?: () => void;
  semester?: Semester;
  showOnly?: Set<ModuleCode>;
  filter?: (module: ModuleCondensed) => boolean;

  // From Redux
  modules: ModuleCondensed[];
}>;

// Maximum number of modules shown in the list
const MAX_MODULES = 50;

function filterModules(term: string, modules: ModuleCondensed[]): ModuleCondensed[] {
  const predicate = createSearchPredicate(term);
  return takeUntil<ModuleCondensed>(modules, MAX_MODULES, predicate);
}

/**
 * Input for selecting modules. Displays a dropdown menu of modules based on the
 * input.
 */
export function PlannerModuleSelectComponent({
  id,
  className,
  rows,
  defaultValue,
  showOnly,
  filter,
  onSelect,
  onCancel,
  onBlur,
  semester,
  modules,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Automatically select everything when the textarea is focused
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.select();
    }
  }, []);

  // Pre-filter modules based on the current semester and the list of pre-selected modules
  const allModules = useMemo(() => {
    let selectedModules = modules;

    if (showOnly) {
      selectedModules = selectedModules.filter((module) => showOnly.has(module.moduleCode));
    }

    if (filter) {
      selectedModules = selectedModules.filter(filter);
    }

    if (semester != null) {
      selectedModules = selectedModules.filter((module) => module.semesters.includes(semester));
    }

    return selectedModules;
  }, [filter, modules, showOnly, semester]);

  return (
    <Downshift
      onChange={onSelect}
      onOuterClick={onBlur}
      initialInputValue={defaultValue}
      initialIsOpen={false}
      initialHighlightedIndex={0}
    >
      {({
        isOpen,
        inputValue,
        selectHighlightedItem,
        getInputProps,
        getItemProps,
        getMenuProps,
        highlightedIndex,
      }) => {
        const filteredModules = filterModules(inputValue || '', allModules);

        return (
          <div className={styles.wrapper}>
            <textarea
              {...(getInputProps({
                // Passed props
                id,
                rows,
                // Hack to get a RefObject<HTMLTextArea> working here
                // since Downshift assumes the input is always an <input>
                ref: textareaRef,
                className: classnames(className, 'form-control form-control-sm'),
                onKeyDown: (evt) => {
                  if (evt.key === 'Enter') {
                    if (filteredModules.length && highlightedIndex != null) {
                      // If there is a highlighed module when the user hits enter, we use that
                      selectHighlightedItem();
                    } else if (inputValue != null) {
                      // Otherwise we use the input value - this allows the user to
                      // enter multiple
                      onSelect(modules.find((module) => module.moduleCode === inputValue) ?? null);
                    }
                  }

                  if (evt.key === 'Escape' && onCancel) onCancel();
                },
                onBlur: () => {
                  // Allow the user to cancel the edit by clicking outside
                  if (onBlur && !isOpen) onBlur();
                },

                // Static props
                placeholder: 'eg. CS1010S',
                autoFocus: true,
              }) as React.HTMLProps<HTMLTextAreaElement>)}
            />

            {isOpen && (
              <ol
                {...getMenuProps({
                  className: styles.dropdown,
                })}
              >
                {filteredModules.map((module, index) => (
                  <li
                    {...getItemProps({
                      key: module.moduleCode,
                      item: module,
                      className: classnames({
                        [styles.highlightItem]: index === highlightedIndex,
                      }),
                    })}
                  >
                    {module.moduleCode} {module.title}
                  </li>
                ))}
              </ol>
            )}
          </div>
        );
      }}
    </Downshift>
  );
}

PlannerModuleSelectComponent.defaultProps = {
  rows: 1,
};

const PlannerModuleSelect = connect((state: State) => ({
  modules: state.moduleBank.moduleList,
}))(PlannerModuleSelectComponent);

export default PlannerModuleSelect;
