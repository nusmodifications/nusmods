import customScalars from './customScalars';

const dateString = '2018-09-01 09:14:20';
const dateUTCString = '2018-09-01T09:14:20.000Z';
const dateInt = 1535793260000;
const dateDate = new Date(dateInt);

const { DateScalarType } = customScalars;

describe('Date scalar', () => {
  it('should parse raw string to Date', () => {
    const date = DateScalarType.parseValue(dateUTCString);
    expect(date).toBeInstanceOf(Date);
    expect(date).toEqual(dateDate);
  });
  it('should parse raw number to Date', () => {
    const date = DateScalarType.parseValue(dateInt);
    expect(date).toBeInstanceOf(Date);
    expect(date).toEqual(dateDate);
  });
  it('should serialize date string to UTC Date', () => {
    const serialized = DateScalarType.serialize(dateString);
    expect(serialized).toEqual(dateDate);
  });
  it('should be in UTC when serialized into json', () => {
    const serialized = DateScalarType.serialize(dateString);
    expect(JSON.parse(JSON.stringify(serialized))).toEqual(dateUTCString);
  });
});
