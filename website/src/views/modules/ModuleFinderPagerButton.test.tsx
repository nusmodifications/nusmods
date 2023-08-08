import { shallow } from 'enzyme';
import { noop } from 'lodash';

import Tooltip from 'views/components/Tooltip';

import ModuleFinderPagerButton from './ModuleFinderPagerButton';
import styles from './ModuleFinderPagerButton.scss';

describe(ModuleFinderPagerButton, () => {
  const defaultProps = {
    onClick: noop,
    children: null,
  };

  test('should render inactive and enabled by default', () => {
    const componentWrapper = shallow(<ModuleFinderPagerButton {...defaultProps} />);
    expect(componentWrapper.exists('button')).toBe(true);
    const button = componentWrapper.find('button');
    expect(button.hasClass(styles.active)).toBe(false);
    expect(button.prop('disabled')).toBeFalsy();
  });

  test('should render active button', () => {
    const componentWrapper = shallow(<ModuleFinderPagerButton {...defaultProps} active />);
    const button = componentWrapper.find('button');
    expect(button.hasClass(styles.active)).toBe(true);
  });

  test('should render disabled button', () => {
    const componentWrapper = shallow(<ModuleFinderPagerButton {...defaultProps} disabled />);
    const button = componentWrapper.find('button');
    expect(button.prop('disabled')).toBe(true);
  });

  test('should only render tooltip in appropriate conditions', () => {
    const componentWrapperWithoutTitle = shallow(<ModuleFinderPagerButton {...defaultProps} />);
    expect(componentWrapperWithoutTitle.exists(Tooltip)).toBe(false);

    const componentWrapperWithTitle = shallow(
      <ModuleFinderPagerButton {...defaultProps} tooltipTitle="test" />,
    );
    expect(componentWrapperWithTitle.exists(Tooltip)).toBe(true);
  });

  test('should respond to clicks', () => {
    const onClick = jest.fn();
    const componentWrapper = shallow(
      <ModuleFinderPagerButton {...defaultProps} onClick={onClick} />,
    );
    componentWrapper.find('button').simulate('click');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
