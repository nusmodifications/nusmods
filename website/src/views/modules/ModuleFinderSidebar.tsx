import { useState } from 'react';
import * as React from 'react';
import {
  NumericRefinementListFilter,
  RefinementListFilter,
  ResetFilters,
  ResetFiltersDisplayProps,
} from 'searchkit';
import { Filter } from 'react-feather';

import { attributeDescription, NUSModuleAttributes } from 'types/modules';
import { RefinementItem } from 'types/views';

import SideMenu, { OPEN_MENU_LABEL } from 'views/components/SideMenu';
import FilterContainer from 'views/components/filters/FilterContainer';
import CheckboxItem from 'views/components/filters/CheckboxItem';
import DropdownListFilters from 'views/components/filters/DropdownListFilters';

import config from 'config';
import styles from './ModuleFinderSidebar.scss';
import ChecklistFilter, { FilterItem } from '../components/filters/ChecklistFilter';

const RESET_FILTER_OPTIONS = { filter: true };

const EXAM_FILTER_ITEMS: FilterItem[] = [
  {
    key: 'no-exam',
    label: 'No Exam',
    filter: {
      bool: {
        must_not: {
          nested: {
            path: 'semesterData',
            query: {
              exists: {
                field: 'semesterData.examDate',
              },
            },
          },
        },
      },
    },
  },
];

const ModuleFinderSidebar: React.FC = React.memo(() => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  return (
    <SideMenu
      isOpen={isMenuOpen}
      toggleMenu={() => setMenuOpen(!isMenuOpen)}
      openIcon={<Filter aria-label={OPEN_MENU_LABEL} />}
    >
      <div className={styles.moduleFilters}>
        <header className={styles.filterHeader}>
          <h3>Refine by</h3>
          <ResetFilters
            className="button"
            options={RESET_FILTER_OPTIONS}
            component={({ hasFilters, resetFilters }: ResetFiltersDisplayProps) =>
              hasFilters && (
                <button
                  className="btn btn-link btn-sm"
                  type="button"
                  onClick={() => resetFilters()}
                >
                  Clear Filters
                </button>
              )
            }
          />
        </header>

        <RefinementListFilter
          id="sem"
          title="Offered In"
          field="semesterData.semester"
          fieldOptions={{
            type: 'nested',
            options: { path: 'semesterData' },
          }}
          operator="OR"
          orderKey="_term"
          orderDirection="asc"
          bucketsTransform={(semItem: RefinementItem[]) =>
            semItem.map(({ key, ...rest }) => ({
              key,
              ...rest,
              label: config.semesterNames[key],
            }))
          }
          containerComponent={FilterContainer}
          itemComponent={CheckboxItem}
        />

        <ChecklistFilter title="Exams" items={EXAM_FILTER_ITEMS} />

        <RefinementListFilter
          id="level"
          title="Level"
          field="moduleCode.level"
          operator="OR"
          orderKey="_term"
          orderDirection="asc"
          containerComponent={FilterContainer}
          itemComponent={CheckboxItem}
        />

        <NumericRefinementListFilter
          id="mcs"
          title="MCs"
          field="moduleCredit"
          multiselect
          options={[
            { title: '0-3 MC', to: 4 },
            { title: '4 MC', from: 4, to: 5 },
            { title: '5-8 MC', from: 5, to: 9 },
            { title: 'More than 8 MC', from: 9 },
          ]}
          containerComponent={FilterContainer}
          itemComponent={CheckboxItem}
        />

        <RefinementListFilter
          id="fac"
          title="Faculty"
          field="faculty.keyword"
          operator="OR"
          size={500}
          containerComponent={FilterContainer}
          itemComponent={CheckboxItem}
          listComponent={DropdownListFilters}
          translations={{ placeholder: 'Add faculties filter...' }}
        />

        <RefinementListFilter
          id="dept"
          title="Department"
          field="department.keyword"
          operator="OR"
          size={500}
          containerComponent={FilterContainer}
          itemComponent={CheckboxItem}
          listComponent={DropdownListFilters}
          translations={{ placeholder: 'Add departments filter...' }}
        />

        <RefinementListFilter
          id="attrs"
          title="Others"
          field="moduleAttributes.keyword"
          operator="OR"
          bucketsTransform={(attributeItem: RefinementItem[]) =>
            attributeItem.map(({ key, ...rest }) => ({
              key,
              ...rest,
              label: attributeDescription[key as keyof NUSModuleAttributes] || key,
            }))
          }
          containerComponent={FilterContainer}
          itemComponent={CheckboxItem}
        />
      </div>
    </SideMenu>
  );
});

ModuleFinderSidebar.displayName = 'ModuleFinderSidebar';

export default ModuleFinderSidebar;
