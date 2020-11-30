import { shallow } from 'enzyme';
import { OnlineComponent } from './Online';

describe(OnlineComponent, () => {
  const testContent = <span>Test</span>;

  test('should return nothing if the app is offline', () => {
    const wrapper = shallow(<OnlineComponent isOnline={false}>{testContent}</OnlineComponent>);
    expect(wrapper.type()).toBeNull();
  });

  test('should return content if the app is online', () => {
    const wrapper = shallow(<OnlineComponent isOnline>{testContent}</OnlineComponent>);
    expect(wrapper.contains(testContent)).toBe(true);
  });

  test('should call render function with isOnline status', () => {
    const render = jest.fn().mockReturnValue(null);
    const wrapper = shallow(<OnlineComponent isOnline>{render}</OnlineComponent>);

    expect(render).toHaveBeenLastCalledWith(true);
    wrapper.setProps({ isOnline: false });
    expect(render).toHaveBeenLastCalledWith(false);
  });

  test('should not rerender if isLive is false', () => {
    const wrapper = shallow(
      <OnlineComponent isOnline={false} isLive={false}>
        {testContent}
      </OnlineComponent>,
    );
    expect(wrapper.type()).toBeNull();
    wrapper.setProps({ isOnline: true });
    expect(wrapper.type()).toBeNull();
  });
});
