import { mount } from 'enzyme';
import useOptimiserForm from 'views/hooks/useOptimiserForm';
import {
  OptimiserLessonTimeRangeSelect,
  OptimiserLunchTimeRangeSelect,
  OptimiserTimeRangeSelect,
  TimeRangeSelectProps,
} from './OptimiserTimeRangeSelect';

jest.mock('./OptimiserFormTooltip', () => ({
  __esModule: true,
  default: () => <div />,
}));

describe('OptimiserTimeRangeSelect', () => {
  it('should call setTime when valuue is changed', () => {
    const setTime = jest.fn();
    const props: TimeRangeSelectProps = {
      currentValue: '0800',
      timeValues: ['0800', '0830', '0900'],
      setTime,
    };
    const wrapper = mount(<OptimiserTimeRangeSelect {...props} />);
    const dropdown = wrapper.find('select');
    expect(dropdown.exists()).toBe(true);
    expect(dropdown.props().value).toEqual('0800');
    dropdown.simulate('change', { target: { value: '0830' } });
    expect(setTime).toHaveBeenCalledTimes(1);
    expect(setTime).toHaveBeenCalledWith('0830');
  });
});

describe('OptimiserLessonTimeRangeSelect', () => {
  const Helper: React.FC = () => {
    const optimiserFormFields = useOptimiserForm();
    return <OptimiserLessonTimeRangeSelect optimiserFormFields={optimiserFormFields} />;
  };

  it('should update the lesson time range', () => {
    const wrapper = mount(<Helper />);
    const dropdowns = wrapper.find('select');
    expect(dropdowns).toHaveLength(2);

    expect(dropdowns.at(0).props().value).toEqual('0800');
    expect(dropdowns.at(1).props().value).toEqual('1900');

    dropdowns.at(0).simulate('change', { target: { value: '0830' } });
    expect(wrapper.find('select').at(0).props().value).toEqual('0830');
    expect(wrapper.find('select').at(1).props().value).toEqual('1900');

    dropdowns.at(1).simulate('change', { target: { value: '1200' } });
    expect(wrapper.find('select').at(0).props().value).toEqual('0830');
    expect(wrapper.find('select').at(1).props().value).toEqual('1200');
  });
});

describe('OptimiserLunchTimeRangeSelect', () => {
  const Helper: React.FC = () => {
    const optimiserFormFields = useOptimiserForm();
    return <OptimiserLunchTimeRangeSelect optimiserFormFields={optimiserFormFields} />;
  };

  it('should update the lunch time range', () => {
    const wrapper = mount(<Helper />);
    const dropdowns = wrapper.find('select');
    expect(dropdowns).toHaveLength(2);

    expect(dropdowns.at(0).props().value).toEqual('1200');
    expect(dropdowns.at(1).props().value).toEqual('1400');

    dropdowns.at(0).simulate('change', { target: { value: '1100' } });
    expect(wrapper.find('select').at(0).props().value).toEqual('1100');
    expect(wrapper.find('select').at(1).props().value).toEqual('1400');

    dropdowns.at(1).simulate('change', { target: { value: '1700' } });
    expect(wrapper.find('select').at(0).props().value).toEqual('1100');
    expect(wrapper.find('select').at(1).props().value).toEqual('1700');
  });
});
