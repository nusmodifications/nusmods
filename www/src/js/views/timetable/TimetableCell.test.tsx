import * as React from 'react';
import { shallow } from 'enzyme';

import { HoverLesson } from 'types/timetables';
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

type Props = {
  onClick?: () => void;
  showTitle?: boolean;
  onHover: (hoverLesson?: HoverLesson | null) => void;
  hoverLesson?: HoverLesson | null;
};

describe(TimetableCell, () => {
  function make(additionalProps: Partial<Props> = {}) {
    const props = {
      onHover: jest.fn(),
      showTitle: false,
      hoverLesson: null,
      ...additionalProps,
    };

    const onClick = jest.fn();

    return {
      onClick,
      onHover: props.onHover,
      wrapper: shallow(<TimetableCell onClick={onClick} lesson={DEFAULT_LESSON} {...props} />),
    };
  }

  test('when onClick is passed', () => {
    it('simulates click events and renders a button', () => {
      const { onClick, wrapper } = make();

      const buttons = wrapper.find('button');
      buttons.at(0).simulate('click', { preventDefault() {} });
      expect(onClick).toBeCalled();
    });

    it('has clickable class styling', () => {
      const { wrapper } = make();

      const button = wrapper.find('button').at(0);
      expect(button.hasClass('clickable')).toBe(true);
    });
  });

  test('hoverLesson', () => {
    it('should highlight lesson when module code, classNo and lessonType matches', () => {
      const { wrapper } = make({
        hoverLesson: {
          moduleCode: 'CS1010',
          classNo: '1',
          lessonType: 'Lecture',
        },
      });

      const button = wrapper.find('button').at(0);
      expect(button.hasClass('hover')).toBe(true);
    });

    it('should not highlight lesson when only module code or classNo match', () => {
      let button;

      button = make({
        hoverLesson: {
          moduleCode: 'CS1010',
          classNo: '1',
          lessonType: 'Tutorial',
        },
      })
        .wrapper.find('button')
        .at(0);

      expect(button.hasClass('hover')).toBe(false);

      button = make({
        hoverLesson: {
          moduleCode: 'CS1010',
          classNo: '2',
          lessonType: 'Lecture',
        },
      })
        .wrapper.find('button')
        .at(0);

      expect(button.hasClass('hover')).toBe(false);

      button = make({
        hoverLesson: {
          moduleCode: 'CS1101S',
          classNo: '1',
          lessonType: 'Lecture',
        },
      })
        .wrapper.find('button')
        .at(0);

      expect(button.hasClass('hover')).toBe(false);
    });
  });
});
