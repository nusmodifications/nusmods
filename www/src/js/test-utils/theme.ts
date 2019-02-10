// @flow

import type { ShallowWrapper, ReactWrapper } from 'enzyme';
import type { ColorIndex } from 'types/reducers';

export function expectColor(element: ReactWrapper | ShallowWrapper, color?: ColorIndex) {
  if (color == null) {
    expect(element.is('[class^="color-"')).toBe(true);
  } else {
    expect(element.hasClass(`color-${color}`)).toBe(true);
  }
}
