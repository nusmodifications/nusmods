// @flow

import { extractRoute } from 'views/components/map/BusStops';

describe(extractRoute, () => {
  test('should find route code', () => {
    expect(extractRoute('A1')).toEqual('A1');
    expect(extractRoute('C')).toEqual('C');
    expect(extractRoute('BTC1')).toEqual('BTC1');
  });

  test('should find route in string starting with route', () => {
    expect(extractRoute('D2(to UTown)')).toEqual('D2');
    expect(extractRoute('C(to FoS)')).toEqual('C');
  });

  test('should return null if no route code is found', () => {
    expect(extractRoute('Kent Ridge MRT')).toEqual(null);
    expect(extractRoute('')).toEqual(null);
  });
});
