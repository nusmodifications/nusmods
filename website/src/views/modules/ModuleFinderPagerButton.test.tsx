import { shallow } from 'enzyme';
import { noop } from 'lodash';

import { fireEvent, render, screen } from '@testing-library/react';
import Tooltip from 'views/components/Tooltip';
import ModuleFinderPagerButton from './ModuleFinderPagerButton';
import styles from './ModuleFinderPagerButton.scss';

describe(ModuleFinderPagerButton, () => {
  const defaultProps = {
    onClick: noop,
    children: null,
  };

  test('should render inactive and enabled by default', () => {
    render(<ModuleFinderPagerButton {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass(styles.active);
    expect(button).not.toBeDisabled();
  });

  test('should render active button', () => {
    render(<ModuleFinderPagerButton {...defaultProps} active />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass(styles.active);
  });

  test('should render disabled button', () => {
    render(<ModuleFinderPagerButton {...defaultProps} disabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
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
    render(<ModuleFinderPagerButton {...defaultProps} onClick={onClick} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
