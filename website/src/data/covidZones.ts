import data from './covidZones.json';

export type CovidZoneId = 'A' | 'B' | 'C' | 'D' | 'E';
export type CovidZones = Record<
  CovidZoneId,
  {
    color: string;
    positions: [number, number][];
  }
>;

const covidZones = data as CovidZones;
export default covidZones;
