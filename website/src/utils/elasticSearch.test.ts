import { mergeModuleHighlight } from './elasticSearch';

describe(mergeModuleHighlight, () => {
  it('should merge highlights into the data', () => {
    expect(
      mergeModuleHighlight(
        'Crime is one feature of human behaviour that fascinates our community. How crimes impact our society and how crimes are investigated and solved in the Singapore context is the focus of the module. The module is designed to enable students to appreciate why and how crimes are committed, to understand how crimes are solved in Singapore using investigative, and the latest scientific and forensic techniques, and to learn the role of the major stakeholders in the Criminal Justice System. Experts from law, pharmacy, statistics, the Health Sciences Authority and the Singapore Police Force will cover topics related to forensic science.',
        [
          'Experts from law, pharmacy, statistics, the Health <mark>Sciences</mark> Authority and the Singapore Police Force',
          'will cover topics related to forensic <mark>science</mark>.',
        ],
      ),
    ).toEqual({
      __html:
        'Crime is one feature of human behaviour that fascinates our community. How crimes impact our society and how crimes are investigated and solved in the Singapore context is the focus of the module. The module is designed to enable students to appreciate why and how crimes are committed, to understand how crimes are solved in Singapore using investigative, and the latest scientific and forensic techniques, and to learn the role of the major stakeholders in the Criminal Justice System. Experts from law, pharmacy, statistics, the Health <mark>Sciences</mark> Authority and the Singapore Police Force will cover topics related to forensic <mark>science</mark>.',
    });

    expect(mergeModuleHighlight('Forensic Science', ['Forensic <mark>Science</mark>'])).toEqual({
      __html: 'Forensic <mark>Science</mark>',
    });
  });

  it('should escape source text', () => {
    expect(mergeModuleHighlight('I <3 Science', undefined)).toEqual({
      __html: 'I &lt;3 Science',
    });

    expect(mergeModuleHighlight('I <3 Science', ['<mark>&lt;3</mark>'])).toEqual({
      __html: 'I <mark>&lt;3</mark> Science',
    });
  });
});
