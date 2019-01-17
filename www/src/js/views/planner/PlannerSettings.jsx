// @flow

import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import config from 'config';
import { getYearsBetween, offsetAcadYear } from 'utils/modules';
import { acadYearLabel } from 'utils/planner';
import { setPlannerIBLOCs, setPlannerMaxYear, setPlannerMinYear } from 'actions/planner';
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

export function getYearLabels(minOffset: number, maxOffset: number) {
  return getYearsBetween(
    offsetAcadYear(config.academicYear, minOffset),
    offsetAcadYear(config.academicYear, maxOffset),
  );
}

function matriculationLabel(year: string, offset: number) {
  const startingYear = acadYearLabel(year);

  if (offset >= 0) return [`Year ${offset + 1}`, `started in ${startingYear}`];
  return [
    `${-offset} ${offset === -1 ? 'year' : 'years'} from matriculation`,
    `starting in ${startingYear}`,
  ];
}

function graduationLabel(offset: number) {
  if (offset === 0) return 'This year';
  if (offset === 1) return 'Next year';
  return `In ${offset} years`;
}

export function PlannerSettingsComponent(props: Props) {
  const matriculationLabels = getYearLabels(MIN_YEARS, MAX_YEARS);
  const graduationLabels = getYearLabels(0, 6);

  return (
    <div>
      <p>I&apos;m currently in</p>
      <ul className={styles.years}>
        {matriculationLabels
          .map((year, i) => {
            const [countLabel, startLabel] = matriculationLabel(year, -i - MIN_YEARS);

            return (
              <li key={year}>
                <button
                  type="button"
                  className={classnames('btn btn-lg btn-block', {
                    'btn-outline-primary': props.minYear !== year,
                    'btn-primary': props.minYear === year,
                  })}
                  onClick={() => props.setMinYear(year)}
                >
                  {countLabel}
                  <br />
                  <span className={styles.startTime}>({startLabel})</span>
                </button>
              </li>
            );
          })
          .reverse()}
      </ul>

      <div>
        <label>
          I have / will be taking iBLOCs
          <Toggle
            labels={['Yes', 'No']}
            isOn={props.iblocs}
            onChange={(checked) => props.setIBLOCs(checked)}
          />
        </label>
      </div>

      <p>I will be graduating</p>
      <ul className={styles.years}>
        {graduationLabels.map((year, offset) => (
          <li key={year}>
            <button
              type="button"
              className={classnames('btn btn-lg btn-block', {
                'btn-outline-primary': props.maxYear !== year,
                'btn-primary': props.maxYear === year,
              })}
              onClick={() => props.setMaxYear(year)}
            >
              {graduationLabel(offset)}
              <br />
              <span className={styles.startTime}>(AY{acadYearLabel(year)})</span>
            </button>
          </li>
        ))}
      </ul>
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
