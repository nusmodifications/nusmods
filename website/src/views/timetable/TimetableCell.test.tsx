import { shallow } from 'enzyme';

import { HoverLesson, InteractableLesson } from 'types/timetables';
import { EVERY_WEEK } from 'test-utils/timetable';
import TimetableCell from './TimetableCell';

const jest = vi;
const LESSON: InteractableLesson = {
  moduleCode: 'CS1010S',
  title: 'Intro',
  classNo: '1',
  lessonType: 'Lecture',
  weeks: EVERY_WEEK,
  day: 'Wednesday',
  startTime: '1000',
  endTime: '1200',
  venue: 'LT26',
  colorIndex: 1,
  lessonId: '1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13',
  canBeSelectedAsActiveLesson: false,
  canBeAddedToLessonConfig: false,
  isActive: false,
  isTaInTimetable: false,
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
  const make = makeFactory(LESSON);
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
        moduleCode: 'CS1010S',
        classNo: '1',
        lessonType: 'Lecture',
        lessonId: '1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13',
      },
    });

    const button = wrapper.find('button').at(0);
    expect(button.hasClass('hover')).toBe(true);
  });

  it('should not highlight lesson when only module code or classNo match', () => {
    let button;

    button = make({
      hoverLesson: {
        moduleCode: 'CS1010S',
        classNo: '1',
        lessonType: 'Tutorial',
        lessonId: '1|MON|0900|1000|COM1-0203|3_4_5_6_7_8_9_10_11_12_13',
      },
    })
      .wrapper.find('button')
      .at(0);

    expect(button.hasClass('hover')).toBe(false);

    button = make({
      hoverLesson: {
        moduleCode: 'CS1010S',
        classNo: '2',
        lessonType: 'Lecture',
        lessonId: '2|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13',
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
        lessonId: '1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13',
      },
    })
      .wrapper.find('button')
      .at(0);

    expect(button.hasClass('hover')).toBe(false);
  });
});

describe(TimetableCell, () => {
  const TA_LESSON: InteractableLesson = {
    ...LESSON,
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

  it('should highlight lesson when module code, classNo, lessonType and lessonId matches', () => {
    const { wrapper } = make({
      hoverLesson: {
        moduleCode: 'CS1010S',
        classNo: '1',
        lessonType: 'Lecture',
        lessonId: '1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13',
      },
    });

    const button = wrapper.find('button').at(0);
    expect(button.hasClass('hover')).toBe(true);
  });

  it('should highlight lesson when only module code, classNo and lessonType matches', () => {
    const { wrapper } = make({
      hoverLesson: {
        moduleCode: 'CS1010S',
        classNo: '1',
        lessonType: 'Lecture',
        lessonId: '2|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13',
      },
    });

    const button = wrapper.find('button').at(0);
    expect(button.hasClass('hover')).toBe(false);
  });

  it('should not highlight lesson when only module code or classNo match', () => {
    let button;

    button = make({
      hoverLesson: {
        moduleCode: 'CS1010S',
        classNo: '1',
        lessonType: 'Tutorial',
        lessonId: '1|MON|0900|1000|COM1-0203|3_4_5_6_7_8_9_10_11_12_13',
      },
    })
      .wrapper.find('button')
      .at(0);

    expect(button.hasClass('hover')).toBe(false);

    button = make({
      hoverLesson: {
        moduleCode: 'CS1010S',
        classNo: '2',
        lessonType: 'Lecture',
        lessonId: '2|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13',
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
        lessonId: '1|WED|1000|1200|LT26|1_2_3_4_5_6_7_8_9_10_11_12_13',
      },
    })
      .wrapper.find('button')
      .at(0);

    expect(button.hasClass('hover')).toBe(false);
  });
});
