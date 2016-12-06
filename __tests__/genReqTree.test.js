import parseString from '../gulp-tasks/local/genReqTree/parseString';
import { normalize } from '../gulp-tasks/local/genReqTree/normalizeString';

/* eslint-disable max-len */

// integration tests, normalize + parse
const parse = string => parseString(normalize(string));

describe('parse', () => {
  it('parses query `(1) either BSP1005 or EC1301 and (2) either DSC2008 or EC2303`)', () => {
    const result = {
      and: [
        {
          or: [
            'BSP1005',
            'EC1301',
          ],
        },
        {
          or: [
            'DSC2008',
            'EC2303',
          ],
        },
      ],
    };
    expect(parse('(1) either BSP1005 or EC1301 and (2) either DSC2008 or EC2303')).toEqual(result);
  });

  it('parses query `CS1010 Programming Methodology or its equivalent, and BT1101`)', () => {
    const result = {
      and: [
        'CS1010',
        'BT1101',
      ],
    };
    expect(parse('CS1010 Programming Methodology or its equivalent, and BT1101')).toEqual(result);
  });

  it('parses query `CE2112 or CE4 standing or higher`)', () => {
    expect(parse('CE2112 or CE4 standing or higher')).toEqual('CE2112');
  });

  it('parses query `(1) CE2112 or (2)CE4444 standing or higher`)', () => {
    const result = {
      or: [
        'CE2112',
        'CE4444',
      ],
    };
    expect(parse('(1) CE2112 or (2)CE4444 standing or higher')).toEqual(result);
  });

  it('parses query `CM2101, CM2142 and CM2192`)', () => {
    const result = {
      and: [
        'CM2101',
        'CM2142',
        'CM2192',
      ],
    };
    expect(parse('CM2101, CM2142 and CM2192')).toEqual(result);
  });

  it('parses query `ES1000 and/or ES1102/ES1103`)', () => {
    const result = {
      or: [
        'ES1000',
        'ES1102',
        'ES1103',
      ],
    };
    expect(parse('ES1000 and/or ES1102/ES1103')).toEqual(result);
  });

  it('parses query `(Undergraduate physics and mathematics AND Electronics materials courses) OR EE2004: Semiconductor Devices OR EE3406: Microelectronic Materials OR EE3431C: Microelectronics Materials & Devices`)', () => {
    const result = {
      or: [
        'EE2004',
        'EE3406',
        'EE3431C',
      ],
    };
    expect(parse('(Undergraduate physics and mathematics AND Electronics materials courses) OR EE2004: Semiconductor Devices OR EE3406: Microelectronic Materials OR EE3431C: Microelectronics Materials & Devices')).toEqual(result);
  });

  it('parses query `(1) EN1101E or GEK1000, and (2) EN majors`)', () => {
    const result = {
      or: [
        'EN1101E',
        'GEK1000',
      ],
    };
    expect(parse('(1) EN1101E or GEK1000, and (2) EN majors')).toEqual(result);
  });

  it('parses query `(IS2101 Business and Technical or CS2101 or their equivalents) and (CS2103/CS2103T or IS2150 E-Business Design and Implementation or BT2101 IT and Decision Making)`)', () => {
    const result = {
      and: [
        {
          or: [
            'IS2101',
            'CS2101',
          ],
        },
        {
          or: [
            'CS2103',
            'CS2103T',
            'IS2150',
            'BT2101',
          ],
        },
      ],
    };
    expect(parse('(IS2101 Business and Technical or CS2101 or their equivalents) and (CS2103/CS2103T or IS2150 E-Business Design and Implementation or BT2101 IT and Decision Making)')).toEqual(result);
  });
});
