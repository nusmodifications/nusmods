import { render, screen } from '@testing-library/react';
import { PinnedSlotConflict } from 'types/optimiser';
import OptimiserPinnedSlotConflicts from './OptimiserPinnedSlotConflicts';

describe('OptimiserPinnedSlotConflicts', () => {
  it('should render nothing when there are no conflicts', () => {
    const { container } = render(<OptimiserPinnedSlotConflicts pinnedSlotConflicts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should list every conflict with its reasons', () => {
    const pinnedSlotConflicts: PinnedSlotConflict[] = [
      {
        moduleCode: 'CS1010S',
        lessonType: 'Tutorial',
        displayText: 'CS1010S Tutorial',
        classNo: '1',
        reasons: ['falls on your free day(s): Monday'],
      },
      {
        moduleCode: 'MA1521',
        lessonType: 'Lecture',
        displayText: 'MA1521 Lecture',
        classNo: '2',
        reasons: ['is outside your selected lesson times (10:00 - 19:00)'],
      },
    ];
    render(<OptimiserPinnedSlotConflicts pinnedSlotConflicts={pinnedSlotConflicts} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Pinned Class Conflicts');
    expect(alert).toHaveTextContent('CS1010S Tutorial (1) falls on your free day(s): Monday');
    expect(alert).toHaveTextContent(
      'MA1521 Lecture (2) is outside your selected lesson times (10:00 - 19:00)',
    );
  });
});
