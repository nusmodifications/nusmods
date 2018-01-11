// @flow
import React from 'react';
import { shallow } from 'enzyme';

import TimetableCell from './TimetableCell';

const DEFAULT_LESSON = {
  ModuleCode: 'CS1010',
  ModuleTitle: 'Intro',
  ClassNo: '1',
  LessonType: 'Lecture',
  WeekText: 'Every Week',
  DayText: 'Wednesday',
  StartTime: '1000',
  EndTime: '1200',
  Venue: 'LT26',
  colorIndex: 1,
};

describe('<TimetableCell />', () => {
  describe('when onClick is passed', () => {
    it('simulates click events and renders a button', () => {
      const onButtonClick = jest.fn();
      const wrapper = shallow(
        <TimetableCell onClick={onButtonClick} lesson={DEFAULT_LESSON} style={{}} />,
      );
      const buttons = wrapper.find('button');
      buttons.at(0).simulate('click', { preventDefault() {} });
      expect(onButtonClick).toBeCalled();
    });

    it('has clickable class styling', () => {
      const onButtonClick = jest.fn();
      const wrapper = shallow(
        <TimetableCell onClick={onButtonClick} lesson={DEFAULT_LESSON} style={{}} />,
      );
      const button = wrapper.find('button').at(0);
      expect(button.hasClass('cellIsClickable')).toBeTruthy();
    });
  });

  describe('when onClick is not passed', () => {
    it('does not simulates click events and renders a div', () => {
      const onButtonClick = jest.fn();
      const wrapper = shallow(<TimetableCell lesson={DEFAULT_LESSON} style={{}} />);
      const buttons = wrapper.find('div');
      buttons.at(0).simulate('click', { preventDefault() {} });
      expect(onButtonClick).not.toBeCalled();
    });
  });
});
