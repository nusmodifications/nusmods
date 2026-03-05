import { shallow } from 'enzyme';
import SearchBox from './SearchBox';

describe(SearchBox, () => {
  test('should match snapshot', () => {
    expect(
      shallow(
        <SearchBox
          throttle={0}
          useInstantSearch={false}
          isLoading={false}
          value=""
          placeholder=""
          onChange={vi.fn()}
          onSearch={vi.fn()}
        />,
      ),
    ).toMatchSnapshot();

    expect(
      shallow(
        <SearchBox
          throttle={0}
          useInstantSearch={false}
          isLoading
          value=""
          placeholder=""
          onChange={vi.fn()}
          onSearch={vi.fn()}
        />,
      ),
    ).toMatchSnapshot();

    expect(
      shallow(
        <SearchBox
          throttle={0}
          useInstantSearch={false}
          isLoading={false}
          value="Hello world"
          placeholder="Testing testing 123"
          onChange={vi.fn()}
          onSearch={vi.fn()}
        />,
      ),
    ).toMatchSnapshot();
  });
});
