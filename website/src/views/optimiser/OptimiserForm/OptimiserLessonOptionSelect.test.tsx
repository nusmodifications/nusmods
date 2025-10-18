import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defaultLectureOption, defaultTutorialOption } from 'test-utils/optimiser';
import { LessonOption } from 'types/optimiser';
import useOptimiserForm from 'views/hooks/useOptimiserForm';
import OptimiserLessonOptionSelect from './OptimiserLessonOptionSelect';

import styles from './OptimiserLessonOptionSelect.scss';

jest.mock('./OptimiserFormTooltip', () => ({
  __esModule: true,
  default: () => <div />,
}));

describe('OptimiserLessonOptionSelect', () => {
  type Props = {
    lessonOptions: LessonOption[];
  };

  const Helper: React.FC<Props> = ({ lessonOptions }) => {
    const optimiserFormFields = useOptimiserForm();
    return (
      <OptimiserLessonOptionSelect
        lessonOptions={lessonOptions}
        optimiserFormFields={optimiserFormFields}
      />
    );
  };

  it('should show a warning when there are no lesson options', () => {
    render(<Helper lessonOptions={[]} />);
    expect(screen.getByRole('alert')).toHaveTextContent('No Lessons Found');
  });

  it('should show all lesson options', () => {
    const lessonOptions = [defaultLectureOption, defaultTutorialOption];
    const { container } = render(<Helper lessonOptions={lessonOptions} />);
    expect(container).not.toHaveTextContent('No Lessons Found');
    expect(container).toHaveTextContent(defaultLectureOption.displayText);
    expect(container).toHaveTextContent(defaultTutorialOption.displayText);
  });

  it('should toggle lesson option', async () => {
    const lessonOptions = [defaultLectureOption];
    render(<Helper lessonOptions={lessonOptions} />);

    const lectureButton = screen.getByRole('button');
    expect(lectureButton).not.toHaveClass(styles.selected);
    expect(lectureButton).toHaveClass(styles.unselected);

    await userEvent.click(lectureButton);
    expect(lectureButton).toHaveClass(styles.selected);
    expect(lectureButton).not.toHaveClass(styles.unselected);

    await userEvent.click(lectureButton);
    expect(lectureButton).not.toHaveClass(styles.selected);
    expect(lectureButton).toHaveClass(styles.unselected);
  });
});
