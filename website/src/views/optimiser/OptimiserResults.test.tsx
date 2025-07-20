import { render, screen } from '@testing-library/react';
import { defaultLectureOption } from 'test-utils/optimiser';
import OptimiserResults, { OptimiserResultsProps } from './OptimiserResults';

const shareableLink = 'https://nusmods.com/timetable/sem-1/share?CS1231S=TUT:01A,LEC:1';

describe('OptimiserResults', () => {
  beforeEach(() => {
    // Provide a dummy implementation to silence the error
    Element.prototype.scrollIntoView = jest.fn();
  });

  it('should render when there is a shareable link', () => {
    const props: OptimiserResultsProps = {
      shareableLink,
      unassignedLessons: [],
    };
    const { container } = render(<OptimiserResults {...props} />);
    expect(container).not.toBeEmptyDOMElement();
  });

  it('should not render when there is no shareable link', () => {
    const props: OptimiserResultsProps = {
      shareableLink: '',
      unassignedLessons: [],
    };
    const { container } = render(<OptimiserResults {...props} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should show full timetable when there are no unassigned lessons', () => {
    const props: OptimiserResultsProps = {
      shareableLink,
      unassignedLessons: [],
    };
    render(<OptimiserResults {...props} />);
    expect(screen.getByRole('button')).toHaveTextContent('Open Optimised Timetable');
  });

  it('should show partial timetable when there are unassigned lessons', () => {
    const props: OptimiserResultsProps = {
      shareableLink,
      unassignedLessons: [defaultLectureOption],
    };
    render(<OptimiserResults {...props} />);
    expect(screen.getByRole('button')).toHaveTextContent('Open Partial Timetable');
  });
});
