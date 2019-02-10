// @flow

import React from 'react';
import { shallow } from 'enzyme';
import SearchBox from './SearchBox';

describe(SearchBox, () => {
  test('should match snapshot', () => {
    expect(
      shallow(
        <SearchBox
          throttle={0}
          useInstantSearch={false}
          initialSearchTerm=""
          placeholder=""
          onSearch={jest.fn()}
        />,
      ),
    ).toMatchSnapshot();

    expect(
      shallow(
        <SearchBox
          throttle={0}
          useInstantSearch={false}
          initialSearchTerm="Hello world"
          placeholder="Testing testing 123"
          onSearch={jest.fn()}
        />,
      ),
    ).toMatchSnapshot();
  });
});
