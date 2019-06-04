import { mapElasticSearchResult } from './elasticSearch';

const MODULE = {
  moduleCode: 'LSM1306',
  title: 'Forensic Science',
  description:
    'Crime is one feature of human behaviour that fascinates our community. How crimes impact our society and how crimes are investigated and solved in the Singapore context is the focus of the module. The module is designed to enable students to appreciate why and how crimes are committed, to understand how crimes are solved in Singapore using investigative, and the latest scientific and forensic techniques, and to learn the role of the major stakeholders in the Criminal Justice System. Experts from law, pharmacy, statistics, the Health Sciences Authority and the Singapore Police Force will cover topics related to forensic science.',
  moduleCredit: '4',
  department: 'Biological Sciences',
  faculty: 'Science',
  workload: [2, 1, 0, 3, 4],
  preclusion: 'GEK1542',
  attributes: {
    lab: true,
    su: true,
    ssgf: true,
  },
  semesterData: [
    {
      semester: 1,
      examDate: '2018-12-01T01:00:00.000Z',
      examDuration: 120,
    },
    {
      semester: 2,
      examDate: '2019-04-27T01:00:00.000Z',
      examDuration: 120,
    },
  ],
  trueAttributes: ['lab', 'su', 'ssgf'],
};

describe(mapElasticSearchResult, () => {
  it('should merge highlights into the data', () => {
    const results = mapElasticSearchResult({
      _index: 'modules',
      _type: '_doc',
      _id: 'MmLWG2sB7uaYDlWO3yFh',
      _score: 31.29264,
      _source: MODULE,
      highlight: {
        description: [
          'Experts from law, pharmacy, statistics, the Health <mark>Sciences</mark> Authority and the Singapore Police Force',
          'will cover topics related to forensic <mark>science</mark>.',
        ],
        title: ['Forensic <mark>Science</mark>'],
      },
    });

    expect(results.title).toEqual('Forensic <mark>Science</mark>');

    expect(results.description).toEqual(
      'Crime is one feature of human behaviour that fascinates our community. How crimes impact our society and how crimes are investigated and solved in the Singapore context is the focus of the module. The module is designed to enable students to appreciate why and how crimes are committed, to understand how crimes are solved in Singapore using investigative, and the latest scientific and forensic techniques, and to learn the role of the major stakeholders in the Criminal Justice System. Experts from law, pharmacy, statistics, the Health <mark>Sciences</mark> Authority and the Singapore Police Force will cover topics related to forensic <mark>science</mark>.',
    );
  });
});
