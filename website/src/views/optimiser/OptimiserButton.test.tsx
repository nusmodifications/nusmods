import { mount } from 'enzyme';
import { defaultLectureOption } from 'test-utils/optimiser';
import OptimiserButton, { OptimiserButtonProps } from './OptimiserButton';

import styles from './OptimiserButton.scss';

describe('OptimiserButton', () => {
  it('should be enabled when there are lesson options', () => {
    const props: OptimiserButtonProps = {
      isOptimising: false,
      lessonOptions: [defaultLectureOption],
      freeDayConflicts: [],
      onClick: jest.fn(),
    };
    const wrapper = mount(<OptimiserButton {...props} />);
    const button = wrapper.find(`.${styles.optimizeButton}`);
    expect(button.exists()).toBe(true);
    expect(button.prop('disabled')).toBeFalsy();
  });

  it('should be disabled when there are no lesson options', () => {
    const props: OptimiserButtonProps = {
      isOptimising: false,
      lessonOptions: [],
      freeDayConflicts: [],
      onClick: jest.fn(),
    };
    const wrapper = mount(<OptimiserButton {...props} />);
    const button = wrapper.find(`.${styles.optimizeButton}`);
    expect(button.exists()).toBe(true);
    expect(button.prop('disabled')).toBe(true);
  });

  it('should be disabled when optimising', () => {
    const props: OptimiserButtonProps = {
      isOptimising: true,
      lessonOptions: [defaultLectureOption],
      freeDayConflicts: [],
      onClick: jest.fn(),
    };
    const wrapper = mount(<OptimiserButton {...props} />);
    const button = wrapper.find(`.${styles.optimizeButton}`);
    expect(button.exists()).toBe(true);
    expect(button.prop('disabled')).toBe(true);
  });

  it('should be disabled when there are free day conflicts', () => {
    const props: OptimiserButtonProps = {
      isOptimising: false,
      lessonOptions: [],
      freeDayConflicts: [
        {
          moduleCode: defaultLectureOption.moduleCode,
          lessonType: defaultLectureOption.lessonType,
          displayText: defaultLectureOption.displayText,
          days: [],
        },
      ],
      onClick: jest.fn(),
    };
    const wrapper = mount(<OptimiserButton {...props} />);
    const button = wrapper.find(`.${styles.optimizeButton}`);
    expect(button.exists()).toBe(true);
    expect(button.prop('disabled')).toBe(true);
  });

  it('should show "Searching and optimising..." when optimising', () => {
    const props: OptimiserButtonProps = {
      isOptimising: true,
      lessonOptions: [defaultLectureOption],
      freeDayConflicts: [],
      onClick: jest.fn(),
    };
    const wrapper = mount(<OptimiserButton {...props} />);
    const button = wrapper.find(`.${styles.optimizeButton}`);
    expect(button.exists()).toBe(true);
    expect(button.text().includes('Searching and optimising...')).toBe(true);
  });

  it('should show "Optimise Timetable" when not optimising', () => {
    const props: OptimiserButtonProps = {
      isOptimising: false,
      lessonOptions: [defaultLectureOption],
      freeDayConflicts: [],
      onClick: jest.fn(),
    };
    const wrapper = mount(<OptimiserButton {...props} />);
    const button = wrapper.find(`.${styles.optimizeButton}`);
    expect(button.exists()).toBe(true);
    expect(button.text().includes('Optimise Timetable')).toBe(true);
  });
});
