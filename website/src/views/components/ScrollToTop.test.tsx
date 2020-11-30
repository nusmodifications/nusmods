import { MemoryRouter } from 'react-router-dom';
import { mount, ReactWrapper } from 'enzyme';
import mockDom from 'test-utils/mockDom';

import ScrollToTop, { ScrollToTopComponent } from './ScrollToTop';

type Props = {
  onComponentDidMount?: boolean;
  onPathChange?: boolean;
};

describe('ScrollToTopComponent', () => {
  beforeEach(() => {
    mockDom();
  });

  // Construct a testable ScrollToTop component
  function make(props: Props = {}) {
    return mount(
      <MemoryRouter>
        {}
        <ScrollToTop
          onComponentDidMount={props.onComponentDidMount}
          onPathChange={props.onPathChange}
        />
      </MemoryRouter>,
    );
  }

  function getHistory(wrapper: ReactWrapper) {
    return wrapper.find(ScrollToTopComponent).prop('history');
  }

  test('default behavior does not do anything', () => {
    make();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  test('onComponentDidMount attribute behaves correctly', () => {
    make({ onComponentDidMount: true });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('onPathChange attribute behaves correctly', () => {
    const wrapper = make({ onPathChange: true });
    const history = getHistory(wrapper);
    expect(window.scrollTo).not.toHaveBeenCalled();
    history.push('/foo');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('onComponentDidMount attribute behaves correctly', () => {
    make({ onComponentDidMount: true });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('integration test', () => {
    const wrapper = make({ onComponentDidMount: true, onPathChange: true });
    const history = getHistory(wrapper);

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    history.push('/foo');
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    history.push('/foo');
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
    history.push('/bar');
    expect(window.scrollTo).toHaveBeenCalledTimes(3);
  });
});
