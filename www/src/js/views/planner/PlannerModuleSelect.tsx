import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import Downshift from 'downshift';
import classnames from 'classnames';

import { ModuleCode, ModuleCondensed, Semester } from 'types/modules';
import { State } from 'reducers';
import { createSearchPredicate } from 'utils/moduleSearch';
import { takeUntil } from 'utils/array';

import styles from './PlannerModuleSelect.scss';

type Props = Readonly<{
  // Input props
  id?: string;
  className?: string;
  rows: number;

  // For filtering
  onSelect: (moduleCode: ModuleCode) => void;
  onCancel?: () => void;
  semester?: Semester;
  showOnly?: Set<ModuleCode>;

  // From Redux
  modules: ModuleCondensed[];
}>;

function filterModules(term: string, modules: ModuleCondensed[]): ModuleCondensed[] {
  const predicate = createSearchPredicate(term);
  return takeUntil<ModuleCondensed>(modules, 10, predicate);
}

export function PlannerModuleSelectComponent({
  id,
  className,
  rows,
  showOnly,
  onSelect,
  onCancel,
  semester,
  modules,
}: Props) {
  // Pre-filter modules based on the current semester and the list of pre-selected modules
  const allModules = useMemo(() => {
    let selectedModules = modules;

    if (showOnly) {
      selectedModules = selectedModules.filter((module) => showOnly.has(module.moduleCode));
    }

    if (semester != null) {
      selectedModules = selectedModules.filter((module) => module.semesters.includes(semester));
    }

    return selectedModules;
  }, [modules, showOnly, semester]);

  return (
    <Downshift onChange={(item: string) => onSelect(item)} isOpen>
      {({ inputValue, getInputProps, getItemProps, getMenuProps, highlightedIndex }) => (
        <div>
          <textarea
            {...getInputProps({
              id,
              rows,
              type: 'search',
              placeholder: 'eg. CS1010S',
              className: classnames(className, 'form-control form-control-sm'),
              onKeyDown: (evt) => {
                if (evt.key === 'Enter' && inputValue) onSelect(inputValue);
                if (evt.key === 'Escape' && onCancel) onCancel();
              },
            })}
          />

          {inputValue && (
            <ol
              {...getMenuProps({
                className: styles.dropdown,
              })}
            >
              {filterModules(inputValue, allModules).map((module, index) => (
                <li
                  {...getItemProps({
                    key: module.moduleCode,
                    item: module.moduleCode,
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
      )}
    </Downshift>
  );
}

PlannerModuleSelectComponent.defaultProps = {
  rows: 1,
};

export default connect((state: State) => ({
  modules: state.moduleBank.moduleList,
}))(PlannerModuleSelectComponent);
