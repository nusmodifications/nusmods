import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defaultLectureOption, defaultTutorialOption } from 'test-utils/optimiser';
import { ClassNo } from 'types/modules';
import { LessonKey, LessonOption } from 'types/optimiser';
import useOptimiserForm from 'views/hooks/useOptimiserForm';
import OptimiserPinnedSlotSelect from './OptimiserPinnedSlotSelect';

vi.mock('./OptimiserFormTooltip', () => ({
  __esModule: true,
  default: () => <div />,
}));

const defaultTimetableClassNos: Record<LessonKey, ClassNo> = {
  [defaultTutorialOption.lessonKey]: '2',
  [defaultLectureOption.lessonKey]: '1',
};

describe('OptimiserPinnedSlotSelect', () => {
  type Props = {
    lessonOptions: LessonOption[];
    timetableClassNos?: Record<LessonKey, ClassNo>;
  };

  const Helper: React.FC<Props> = ({
    lessonOptions,
    timetableClassNos = defaultTimetableClassNos,
  }) => {
    const optimiserFormFields = useOptimiserForm();
    return (
      <OptimiserPinnedSlotSelect
        lessonOptions={lessonOptions}
        timetableClassNos={timetableClassNos}
        optimiserFormFields={optimiserFormFields}
      />
    );
  };

  it('should render nothing when there are no lesson options', () => {
    const { container } = render(<Helper lessonOptions={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should show a button per lesson labelled with the timetable classNo', () => {
    const lessonOptions = [defaultLectureOption, defaultTutorialOption];
    render(<Helper lessonOptions={lessonOptions} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: `${defaultLectureOption.displayText} · 1` }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: `${defaultTutorialOption.displayText} · 2` }),
    ).toBeEnabled();
  });

  it('should toggle a pin on click', async () => {
    render(<Helper lessonOptions={[defaultTutorialOption]} />);

    const button = screen.getByRole('button');
    expect(button.className).toContain('unselected');

    await userEvent.click(button);
    expect(button.className).toContain('selected');
    expect(button.className).not.toContain('unselected');

    await userEvent.click(button);
    expect(button.className).toContain('unselected');
  });

  it('should disable the button when the timetable selection cannot be resolved', () => {
    render(<Helper lessonOptions={[defaultTutorialOption]} timetableClassNos={{}} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(defaultTutorialOption.displayText);
  });
});
