import { shallow } from 'enzyme';

import { ColoredLesson, HoverLesson } from 'types/timetables';
import { EVERY_WEEK } from 'test-utils/timetable';
import TimetableCell from './TimetableCell';

const DEFAULT_LESSON: ColoredLesson = {
  moduleCode: 'CS1010',
  title: 'Intro',
  classNo: '1',
  lessonType: 'Lecture',
  weeks: EVERY_WEEK,
  day: 'Wednesday',
  startTime: '1000',
  endTime: '1200',
  venue: 'LT26',
  colorIndex: 1,
};

type Props = {
  onClick?: () => void;
  showTitle?: boolean;
  onHover: (hoverLesson?: HoverLesson | null) => void;
  hoverLesson?: HoverLesson | null;
};

function make(additionalProps: Partial<Props> = {}) {
  const props = {
    onHover: jest.fn(),
    showTitle: false,
    hoverLesson: null,
    transparent: false,
    ...additionalProps,
  };

  const onClick = jest.fn();

  return {
    onClick,
    onHover: props.onHover,
    wrapper: shallow(
      <TimetableCell onClick={onClick} lesson={DEFAULT_LESSON} {...props} customisedModules={[]} />,
    ),
  };
}

describe(TimetableCell, () => {
  it('simulates click events and renders a button', () => {
    const { onClick, wrapper } = make();

    const buttons = wrapper.find('button');
    buttons.at(0).simulate('click', {
      preventDefault: jest.fn(),
      currentTarget: document.createElement('button'),
    });
    expect(onClick).toBeCalled();
  });

  it('has clickable class styling', () => {
    const { wrapper } = make();

    const button = wrapper.find('button').at(0);
    expect(button.hasClass('clickable')).toBe(true);
  });

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
