// @flow

import React from 'react';
import { mount } from 'enzyme';
import _ from 'lodash';
import { Link, MemoryRouter } from 'react-router-dom';

import type { ModuleWithColor, Semester } from 'types/modules';
import mockModules from '__mocks__/modules';

/** @vars {Module} */
import GER1000 from '__mocks__/modules/GER1000.json';

import ExamCalendar from './ExamCalendar';
import styles from './ExamCalendar.scss';

const modulesWithColor = mockModules.map((module, i) => ({
  ...module,
  colorIndex: i,
}));

function make(modules: ModuleWithColor[] = [], semester: Semester = 1) {
  return mount(
    <MemoryRouter>
      <ExamCalendar semester={semester} modules={modules} />
    </MemoryRouter>,
  );
}

describe('ExamCalendar', () => {
  test('show month names only in the first cell and on first day of month', () => {
    const wrapper = make(modulesWithColor);

    // AY17/18 semester 1 exams are from Nov 27 to Dec 9
    //    November 2017         December 2017
    // Su Mo Tu We Th Fr Sa  Su Mo Tu We Th Fr Sa
    //           1  2  3  4                  1  2
    //  5  6  7  8  9 10 11   3  4  5  6  7  8  9
    // 12 13 14 15 16 17 18  10 11 12 13 14 15 16
    // 19 20 21 22 23 24 25  17 18 19 20 21 22 23
    // 26 27 28 29 30        24 25 26 27 28 29 30
    //                       31
    wrapper.find(`.${styles.day} h3`).forEach((element, index) => {
      if (index === 0) {
        expect(element.text()).toEqual('Nov 27');
      } else if (index === 4) {
        expect(element.text()).toEqual('Dec 1');
      } else {
        // Expect it to be a valid numeric string from 1-31
        expect(_.range(1, 32)).toContain(Number(element.text()));
      }
    });
  });

  test('show modules that have exams', () => {
    const wrapper = make(modulesWithColor);

    expect(
      wrapper
        .find(Link)
        .map((element) => element.find(`.${styles.moduleCode}`).text())
        .sort(),
    ).toEqual(['ACC2002', 'CS1010S', 'GES1021', 'PC1222']);
  });

  test('show modules outside the two week exam period', () => {
    const wrapper = make([GER1000]);

    expect(wrapper.find(Link)).toHaveLength(1);
  });
});
