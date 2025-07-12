import { LessonOption } from 'types/optimiser';
import useOptimiserForm from 'views/hooks/useOptimiserForm';
import { mount } from 'enzyme';
import { defaultLectureOption, defaultTutorialOption } from 'test-utils/optimiser';
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
    const wrapper = mount(<Helper lessonOptions={[]} />);
    expect(wrapper.text().includes('No Lessons Found')).toBe(true);
    expect(wrapper.find(`.${styles.lessonButtons}`).exists()).toBe(false);
  });

  it('should show all lesson options', () => {
    const lessonOptions = [defaultLectureOption, defaultTutorialOption];
    const wrapper = mount(<Helper lessonOptions={lessonOptions} />);
    expect(wrapper.text().includes('No Lessons Found')).toBe(false);
    expect(wrapper.find(`.${styles.lessonButtons}`).exists()).toBe(true);
    expect(wrapper.find(`.${styles.lessonButton}`)).toHaveLength(2);
    expect(wrapper.text().includes(defaultLectureOption.displayText)).toBe(true);
    expect(wrapper.text().includes(defaultTutorialOption.displayText)).toBe(true);
  });

  it('should toggle lesson option', () => {
    const lessonOptions = [defaultLectureOption];
    const wrapper = mount(<Helper lessonOptions={lessonOptions} />);
    const lectureButton = wrapper.find(`.${styles.lessonButton}`);
    expect(lectureButton).toHaveLength(1);
    expect(wrapper.find(`.${styles.selected}`).exists()).toBe(false);
    expect(wrapper.find(`.${styles.unselected}`).exists()).toBe(true);

    lectureButton.simulate('click');
    expect(wrapper.find(`.${styles.selected}`).exists()).toBe(true);
    expect(wrapper.find(`.${styles.unselected}`).exists()).toBe(false);

    lectureButton.simulate('click');
    expect(wrapper.find(`.${styles.selected}`).exists()).toBe(false);
    expect(wrapper.find(`.${styles.unselected}`).exists()).toBe(true);
  });
});
