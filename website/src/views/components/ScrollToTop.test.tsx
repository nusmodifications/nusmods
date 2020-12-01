import { act } from 'react-dom/test-utils';
import { Router } from 'react-router-dom';
import { mount } from 'enzyme';
import createHistory from 'test-utils/createHistory';
import { mockDom, mockDomReset } from 'test-utils/mockDom';

import ScrollToTop from './ScrollToTop';

type Props = {
  onComponentDidMount?: boolean;
  onPathChange?: boolean;
};

describe('ScrollToTopComponent', () => {
  beforeEach(() => {
    mockDom();
  });

  afterEach(() => {
    mockDomReset();
  });

  function make(props: Props = {}) {
    const { history } = createHistory();
    act(() => {
      mount(
        <Router history={history}>
          <ScrollToTop
            onComponentDidMount={props.onComponentDidMount}
            onPathChange={props.onPathChange}
          />
        </Router>,
      );
    });
    return history;
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
    const history = make({ onPathChange: true });
    expect(window.scrollTo).not.toHaveBeenCalled();
    act(() => history.push('/foo'));
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('onComponentDidMount attribute behaves correctly', () => {
    make({ onComponentDidMount: true });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('integration test', () => {
    const history = make({ onComponentDidMount: true, onPathChange: true });
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    act(() => history.push('/foo'));
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    act(() => history.push('/foo'));
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
    act(() => history.push('/bar'));
    expect(window.scrollTo).toHaveBeenCalledTimes(3);
  });
});
