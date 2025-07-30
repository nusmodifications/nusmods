import { render, screen } from '@testing-library/react';
import { defaultLectureOption } from 'test-utils/optimiser';
import OptimiserButton, { OptimiserButtonProps } from './OptimiserButton';

describe('OptimiserButton', () => {
  it('should be enabled when there are lesson options', () => {
    const props: OptimiserButtonProps = {
      isOptimising: false,
      lessonOptions: [defaultLectureOption],
      freeDayConflicts: [],
      onClick: jest.fn(),
    };
    render(<OptimiserButton {...props} />);
    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('should be disabled when there are no lesson options', () => {
    const props: OptimiserButtonProps = {
      isOptimising: false,
      lessonOptions: [],
      freeDayConflicts: [],
      onClick: jest.fn(),
    };
    render(<OptimiserButton {...props} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should be disabled when optimising', () => {
    const props: OptimiserButtonProps = {
      isOptimising: true,
      lessonOptions: [defaultLectureOption],
      freeDayConflicts: [],
      onClick: jest.fn(),
    };
    render(<OptimiserButton {...props} />);
    expect(screen.getByRole('button')).toBeDisabled();
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
    render(<OptimiserButton {...props} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should show "Searching and optimising..." when optimising', () => {
    const props: OptimiserButtonProps = {
      isOptimising: true,
      lessonOptions: [defaultLectureOption],
      freeDayConflicts: [],
      onClick: jest.fn(),
    };
    render(<OptimiserButton {...props} />);
    expect(screen.getByRole('button')).toHaveTextContent('Searching and optimising...');
  });

  it('should show "Optimise Timetable" when not optimising', () => {
    const props: OptimiserButtonProps = {
      isOptimising: false,
      lessonOptions: [defaultLectureOption],
      freeDayConflicts: [],
      onClick: jest.fn(),
    };
    render(<OptimiserButton {...props} />);
    expect(screen.getByRole('button')).toHaveTextContent('Optimise Timetable');
  });
});
