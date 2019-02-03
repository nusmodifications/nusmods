// @flow

import { generatePrereqTree, node } from './tree';

const n = node;

describe(generatePrereqTree, () => {
  test('should handle branches', () => {
    expect(
      generatePrereqTree({
        or: ['EE2004', 'EE3406', 'EE3431C'],
      }),
    ).toEqual(n('or', [n('EE2004'), n('EE3406'), n('EE3431C')]));

    expect(
      generatePrereqTree({
        and: ['CM2101', 'CM2142', 'CM2192'],
      }),
    ).toEqual(n('and', [n('CM2101'), n('CM2142'), n('CM2192')]));
  });

  test('should handle nested branches', () => {
    expect(
      generatePrereqTree({
        and: [
          {
            or: ['IS2101', 'CS2101'],
          },
          {
            or: ['CS2103', 'CS2103T', 'IS2150', 'BT2101'],
          },
        ],
      }),
    ).toEqual(
      n('and', [
        n('or', [n('IS2101'), n('CS2101')]),
        n('or', [n('CS2103'), n('CS2103T'), n('IS2150'), n('BT2101')]),
      ]),
    );
  });
});
