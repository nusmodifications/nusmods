import { mount } from 'enzyme';
import { defaultTutorialOption } from 'test-utils/optimiser';
import OptimiserFreeDayConflicts from './OptimiserFreeDayConflicts';

describe('OptimiserFreeDayConflicts', () => {
  it('should show a warning when there are conflicts', () => {
    const freeDayConflicts = [
      {
        moduleCode: defaultTutorialOption.moduleCode,
        lessonType: defaultTutorialOption.lessonType,
        displayText: defaultTutorialOption.displayText,
        days: ['Monday', 'Tuesday'],
      },
    ];
    const wrapper = mount(<OptimiserFreeDayConflicts freeDayConflicts={freeDayConflicts} />);
    expect(wrapper.text().includes('Free Day Conflicts')).toBe(true);
    expect(wrapper.text().includes(defaultTutorialOption.displayText)).toBe(true);
  });

  it('should not render when there are no conflicts', () => {
    const wrapper = mount(<OptimiserFreeDayConflicts freeDayConflicts={[]} />);
    expect(wrapper.isEmptyRender()).toBe(true);
  });
});
