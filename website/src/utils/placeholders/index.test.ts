import { each } from 'lodash';

import { PlannerPlaceholder } from 'types/planner';

import general from './general';
import cs from './cs';

describe('Placeholders', () => {
  test('should have same ID as object key', () => {
    const expectKeyMatchId = (placeholder: PlannerPlaceholder, key: string) => {
      expect(key).toEqual(placeholder.id);
    };

    each(general, expectKeyMatchId);
    each(cs, expectKeyMatchId);
  });

  test('should have unique ID', () => {
    const idMap = new Map<string, PlannerPlaceholder>();

    const expectUniqueId = (placeholder: PlannerPlaceholder, key: string) => {
      expect(idMap.get(key)).toBeUndefined();
      idMap.set(key, placeholder);
    };

    each(general, expectUniqueId);
    each(cs, expectUniqueId);
  });
});
