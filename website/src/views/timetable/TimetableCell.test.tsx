import { shallow } from 'enzyme';

import { HoverLesson, InteractableLesson } from 'types/timetables';
import { EVERY_WEEK } from 'test-utils/timetable';
import TimetableCell from './TimetableCell';

const NON_TA_LESSON: InteractableLesson = {
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
  lessonIndex: 1,
};

type Props = {
  onClick?: () => void;
  showTitle?: boolean;
  onHover: (hoverLesson?: HoverLesson | null) => void;
  hoverLesson?: HoverLesson | null;
};

const makeFactory =
  (lesson: InteractableLesson) =>
  (additionalProps: Partial<Props> = {}) => {
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
      wrapper: shallow(<TimetableCell onClick={onClick} lesson={lesson} {...props} />),
    };
  };

describe(TimetableCell, () => {
  const make = makeFactory(NON_TA_LESSON);
  it('simulates click events and renders a button', () => {
    const { onClick, wrapper } = make();

    const buttons = wrapper.find('button');
    buttons.at(0).simulate('click', {
      preventDefault: jest.fn(),
      currentTarget: document.createElement('button'),
    });
    expect(onClick).toHaveBeenCalled();
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
        lessonIndex: 1,
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
        lessonIndex: 2,
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
        lessonIndex: 3,
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
        lessonIndex: 0,
      },
    })
      .wrapper.find('button')
      .at(0);

    expect(button.hasClass('hover')).toBe(false);
  });
});

describe(TimetableCell, () => {
  const TA_LESSON: InteractableLesson = {
    ...NON_TA_LESSON,
    isTaInTimetable: true,
  };
  const make = makeFactory(TA_LESSON);
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

  it('should highlight lesson when module code, classNo, lessonType and lessonIndex matches', () => {
    const { wrapper } = make({
      hoverLesson: {
        moduleCode: 'CS1010',
        classNo: '1',
        lessonType: 'Lecture',
        lessonIndex: 1,
      },
    });

    const button = wrapper.find('button').at(0);
    expect(button.hasClass('hover')).toBe(true);
  });

  it('should highlight lesson when only module code, classNo and lessonType matches', () => {
    const { wrapper } = make({
      hoverLesson: {
        moduleCode: 'CS1010',
        classNo: '1',
        lessonType: 'Lecture',
        lessonIndex: 2,
      },
    });

    const button = wrapper.find('button').at(0);
    expect(button.hasClass('hover')).toBe(false);
  });

  it('should not highlight lesson when only module code or classNo match', () => {
    let button;

    button = make({
      hoverLesson: {
        moduleCode: 'CS1010',
        classNo: '1',
        lessonType: 'Tutorial',
        lessonIndex: 2,
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
        lessonIndex: 3,
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
        lessonIndex: 0,
      },
    })
      .wrapper.find('button')
      .at(0);

    expect(button.hasClass('hover')).toBe(false);
  });
});
