import { render } from '@testing-library/react';
import { defaultTutorialOption } from 'test-utils/optimiser';
import { TimeRange } from 'types/optimiser';
import OptimiserTimeRangeConflicts from './OptimiserTimeRangeConflicts';

const lessonTimeRange: TimeRange = { earliest: '1000', latest: '1900' };

describe('OptimiserTimeRangeConflicts', () => {
  it('should show a warning when there are conflicts', () => {
    const timeRangeConflicts = [
      {
        moduleCode: defaultTutorialOption.moduleCode,
        lessonType: defaultTutorialOption.lessonType,
        displayText: defaultTutorialOption.displayText,
        classNo: '1',
      },
    ];
    const { container } = render(
      <OptimiserTimeRangeConflicts
        timeRangeConflicts={timeRangeConflicts}
        lessonTimeRange={lessonTimeRange}
      />,
    );
    expect(container).toHaveTextContent('Lesson Time Conflicts');
    expect(container).toHaveTextContent('10:00 - 19:00');
    expect(container).toHaveTextContent(defaultTutorialOption.displayText);
  });

  it('should not render when there are no conflicts', () => {
    const { container } = render(
      <OptimiserTimeRangeConflicts timeRangeConflicts={[]} lessonTimeRange={lessonTimeRange} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
