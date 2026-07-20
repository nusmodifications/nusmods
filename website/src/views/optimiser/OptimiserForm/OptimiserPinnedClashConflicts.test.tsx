import { render } from '@testing-library/react';
import { defaultLectureOption, defaultTutorialOption } from 'test-utils/optimiser';
import OptimiserPinnedClashConflicts from './OptimiserPinnedClashConflicts';

describe('OptimiserPinnedClashConflicts', () => {
  it('should show a warning when there are clashes', () => {
    const pinnedClashConflicts = [
      {
        first: {
          moduleCode: defaultTutorialOption.moduleCode,
          lessonType: defaultTutorialOption.lessonType,
          displayText: defaultTutorialOption.displayText,
          classNo: '2',
        },
        second: {
          moduleCode: defaultLectureOption.moduleCode,
          lessonType: defaultLectureOption.lessonType,
          displayText: defaultLectureOption.displayText,
          classNo: '1',
        },
      },
    ];
    const { container } = render(
      <OptimiserPinnedClashConflicts pinnedClashConflicts={pinnedClashConflicts} />,
    );
    expect(container).toHaveTextContent('Pinned Class Clashes');
    expect(container).toHaveTextContent(defaultTutorialOption.displayText);
    expect(container).toHaveTextContent(defaultLectureOption.displayText);
  });

  it('should not render when there are no clashes', () => {
    const { container } = render(<OptimiserPinnedClashConflicts pinnedClashConflicts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
