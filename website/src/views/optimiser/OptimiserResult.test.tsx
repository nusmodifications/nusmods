import { shallow } from 'enzyme';
import { defaultLectureOption } from 'test-utils/optimiser';

import styles from './OptimiserResults.scss';
import OptimiserResults, { OptimiserResultsProps } from './OptimiserResults';

const shareableLink = 'https://nusmods.com/timetable/sem-1/share?CS1231S=TUT:01A,LEC:1';

describe('OptimiserResults', () => {
  it('should render when there is a shareable link', () => {
    const props: OptimiserResultsProps = {
      shareableLink,
      unassignedLessons: [],
    };
    const wrapper = shallow(<OptimiserResults {...props} />);
    expect(wrapper.isEmptyRender()).toBe(false);
  });

  it('should not render when there is no shareable link', () => {
    const props: OptimiserResultsProps = {
      shareableLink: '',
      unassignedLessons: [],
    };
    const wrapper = shallow(<OptimiserResults {...props} />);
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('should show full timetable when there are no unassigned lessons', () => {
    const props: OptimiserResultsProps = {
      shareableLink,
      unassignedLessons: [],
    };
    const wrapper = shallow(<OptimiserResults {...props} />);
    const div = wrapper.find(`.${styles.shareableLinkSection}`);
    expect(div.exists()).toBe(true);
    expect(div.text().includes('Open Optimised Timetable')).toBe(true);
  });

  it('should show partial timetable when there are unassigned lessons', () => {
    const props: OptimiserResultsProps = {
      shareableLink,
      unassignedLessons: [defaultLectureOption],
    };
    const wrapper = shallow(<OptimiserResults {...props} />);
    const div = wrapper.find(`.${styles.unassignedWarning}`);
    expect(div.exists()).toBe(true);
    expect(div.text().includes('Optimiser Warning : Unassigned Lessons')).toBe(true);
  });
});
