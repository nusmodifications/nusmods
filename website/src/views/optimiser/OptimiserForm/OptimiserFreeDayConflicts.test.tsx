import { render } from '@testing-library/react';
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
    const { container } = render(<OptimiserFreeDayConflicts freeDayConflicts={freeDayConflicts} />);
    expect(container).toHaveTextContent('Free Day Conflicts');
    expect(container).toHaveTextContent(defaultTutorialOption.displayText);
  });

  it('should not render when there are no conflicts', () => {
    const { container } = render(<OptimiserFreeDayConflicts freeDayConflicts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
