import useOptimiserForm from 'views/hooks/useOptimiserForm';
import { mount } from 'enzyme';
import OptimiserFreeDaySelect from './OptimiserFreeDaySelect';

import styles from './OptimiserFreeDaySelect.scss';

jest.mock('./OptimiserFormTooltip', () => ({
  __esModule: true,
  default: () => <div />,
}));

describe('OptimiserLessonOptionSelect', () => {
  type Props = {
    hasSaturday: boolean;
  };

  const Helper: React.FC<Props> = ({ hasSaturday }) => {
    const optimiserFormFields = useOptimiserForm();
    return (
      <OptimiserFreeDaySelect hasSaturday={hasSaturday} optimiserFormFields={optimiserFormFields} />
    );
  };

  it('should not show saturday', () => {
    const wrapper = mount(<Helper hasSaturday={false} />);
    expect(wrapper.text().includes('Monday')).toBe(true);
    expect(wrapper.text().includes('Tuesday')).toBe(true);
    expect(wrapper.text().includes('Wednesday')).toBe(true);
    expect(wrapper.text().includes('Thursday')).toBe(true);
    expect(wrapper.text().includes('Friday')).toBe(true);
    expect(wrapper.text().includes('Saturday')).toBe(false);
  });

  it('should show saturday', () => {
    const wrapper = mount(<Helper hasSaturday />);
    expect(wrapper.text().includes('Monday')).toBe(true);
    expect(wrapper.text().includes('Tuesday')).toBe(true);
    expect(wrapper.text().includes('Wednesday')).toBe(true);
    expect(wrapper.text().includes('Thursday')).toBe(true);
    expect(wrapper.text().includes('Friday')).toBe(true);
    expect(wrapper.text().includes('Saturday')).toBe(true);
  });

  it('should toggle the selected day', () => {
    const wrapper = mount(<Helper hasSaturday={false} />);
    const monday = wrapper.find(`.${styles.freeDaysButton}`).at(0);
    expect(monday.hasClass('active')).toBe(false);
    monday.simulate('click');
    expect(wrapper.find(`.${styles.freeDaysButton}`).at(0).hasClass('active')).toBe(true);
    monday.simulate('click');
    expect(wrapper.find(`.${styles.freeDaysButton}`).at(0).hasClass('active')).toBe(false);
  });
});
