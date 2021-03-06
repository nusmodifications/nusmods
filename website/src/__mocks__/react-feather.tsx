import { mapValues } from 'lodash';
import type { ComponentType } from 'react';
import * as feather from 'react-feather';

module.exports = mapValues(feather, (_component, name) => {
  const MockComponent = jest.fn(() => <div data-testid={`react-feather ${name} icon`} />);
  (MockComponent as ComponentType).displayName = name;
  return MockComponent;
});
