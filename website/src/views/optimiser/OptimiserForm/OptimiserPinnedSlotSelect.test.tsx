import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defaultLectureOption, defaultTutorialOption } from 'test-utils/optimiser';
import { LessonKey, LessonOption, PinnedSlotOption } from 'types/optimiser';
import useOptimiserForm from 'views/hooks/useOptimiserForm';
import OptimiserPinnedSlotSelect, { UNPINNED_OPTION_LABEL } from './OptimiserPinnedSlotSelect';

vi.mock('./OptimiserFormTooltip', () => ({
  __esModule: true,
  default: () => <div />,
}));

const defaultPinnedSlotOptions: Record<LessonKey, PinnedSlotOption[]> = {
  [defaultTutorialOption.lessonKey]: [
    { classNo: '1', label: '1 — Mon 09:00-10:00' },
    { classNo: '2', label: '2 — Tue 09:00-10:00' },
  ],
  [defaultLectureOption.lessonKey]: [{ classNo: '1', label: '1 — Wed 10:00-12:00' }],
};

describe('OptimiserPinnedSlotSelect', () => {
  type Props = {
    lessonOptions: LessonOption[];
    pinnedSlotOptions?: Record<LessonKey, PinnedSlotOption[]>;
  };

  const Helper: React.FC<Props> = ({
    lessonOptions,
    pinnedSlotOptions = defaultPinnedSlotOptions,
  }) => {
    const optimiserFormFields = useOptimiserForm();
    return (
      <OptimiserPinnedSlotSelect
        lessonOptions={lessonOptions}
        pinnedSlotOptions={pinnedSlotOptions}
        optimiserFormFields={optimiserFormFields}
      />
    );
  };

  it('should render nothing when there are no lesson options', () => {
    const { container } = render(<Helper lessonOptions={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should show a dropdown per lesson defaulting to unpinned', () => {
    const lessonOptions = [defaultLectureOption, defaultTutorialOption];
    const { container } = render(<Helper lessonOptions={lessonOptions} />);
    expect(container).toHaveTextContent(defaultLectureOption.displayText);
    expect(container).toHaveTextContent(defaultTutorialOption.displayText);

    const dropdowns = screen.getAllByRole('combobox');
    expect(dropdowns).toHaveLength(2);
    dropdowns.forEach((dropdown) => expect(dropdown).toHaveValue(''));
    expect(screen.getAllByRole('option', { name: UNPINNED_OPTION_LABEL })).toHaveLength(2);
  });

  it('should pin and unpin a class', async () => {
    render(<Helper lessonOptions={[defaultTutorialOption]} />);

    const dropdown = screen.getByRole('combobox');
    expect(screen.getAllByRole('option')).toHaveLength(3);

    await userEvent.selectOptions(dropdown, '2');
    expect(dropdown).toHaveValue('2');

    await userEvent.selectOptions(dropdown, '');
    expect(dropdown).toHaveValue('');
  });

  it('should show only the unpinned option when a lesson has no class options', () => {
    render(<Helper lessonOptions={[defaultTutorialOption]} pinnedSlotOptions={{}} />);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent(UNPINNED_OPTION_LABEL);
  });
});
