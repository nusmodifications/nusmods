// @flow

import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import config from 'config';
import { getYearsBetween, offsetAcadYear } from 'utils/modules';
import { acadYearLabel } from 'utils/planner';
import { setPlannerIBLOCs, setPlannerMaxYear, setPlannerMinYear } from 'actions/planner';
import ExternalLink from 'views/components/ExternalLink';
import Toggle from 'views/components/Toggle';
import styles from './PlannerSettings.scss';

type Props = {|
  +minYear: string,
  +maxYear: string,
  +iblocs: boolean,

  // Actions
  +setMinYear: (string) => void,
  +setMaxYear: (string) => void,
  +setIBLOCs: (boolean) => void,
|};

const MIN_YEARS = -5; // Studying year 6
const MAX_YEARS = 1; // One year before matriculation

// Extracted to a constant to reduce re-renders
const TOGGLE_LABELS = ['Yes', 'No'];

export function getYearLabels(minOffset: number, maxOffset: number) {
  return getYearsBetween(
    offsetAcadYear(config.academicYear, minOffset),
    offsetAcadYear(config.academicYear, maxOffset),
  );
}

function graduationLabel(offset: number) {
  if (offset === 0) return 'This year';
  if (offset === 1) return 'Next year';
  return `In ${offset} years`;
}

export function PlannerSettingsComponent(props: Props) {
  const matriculationLabels = getYearLabels(MIN_YEARS, MAX_YEARS).reverse();
  const graduationLabels = getYearLabels(0, 6);

  return (
    <div className={styles.settings}>
      <section>
        <h2 className={styles.label}>Matriculated in</h2>
        <ul className={styles.years}>
          {matriculationLabels.map((year, i) => {
            const offset = i - MAX_YEARS;

            return (
              <li key={year}>
                <button
                  type="button"
                  className={classnames('btn btn-block', {
                    'btn-outline-primary': props.minYear !== year,
                    'btn-primary': props.minYear === year,
                  })}
                  onClick={() => props.setMinYear(year)}
                  disabled={year > props.maxYear}
                >
                  AY{acadYearLabel(year)}
                  <span className={styles.subtitle}>
                    (
                    {offset >= 0
                      ? `currently year ${offset + 1}`
                      : graduationLabel(-offset).toLowerCase()}
                    )
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className={styles.label}>Graduating</h2>
        <ul className={styles.years}>
          {graduationLabels.map((year, offset) => (
            <li key={year}>
              <button
                type="button"
                className={classnames('btn btn-block', {
                  'btn-outline-primary': props.maxYear !== year,
                  'btn-primary': props.maxYear === year,
                })}
                onClick={() => props.setMaxYear(year)}
                disabled={year < props.minYear}
              >
                {graduationLabel(offset)}
                <span className={styles.subtitle}>(AY{acadYearLabel(year)})</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.toggleSection}>
        <div>
          <h2 className={styles.label}>Taking iBLOCs</h2>

          <p>
            <ExternalLink href="http://www.nus.edu.sg/ibloc/iBLOC.html">iBLOCs</ExternalLink> is a
            program that allow full-time NSmen to read some modules before matriculating.
          </p>
        </div>

        <Toggle
          labels={TOGGLE_LABELS}
          isOn={props.iblocs}
          onChange={(checked) => props.setIBLOCs(checked)}
        />
      </section>
    </div>
  );
}

const PlannerSettings = connect(
  (state) => ({
    minYear: state.planner.minYear,
    maxYear: state.planner.maxYear,
    iblocs: state.planner.iblocs,
  }),
  {
    setMaxYear: setPlannerMaxYear,
    setMinYear: setPlannerMinYear,
    setIBLOCs: setPlannerIBLOCs,
  },
)(PlannerSettingsComponent);

export default PlannerSettings;
