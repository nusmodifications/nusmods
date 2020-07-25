import * as React from 'react';
import config from 'config';

const eggs: Record<string, string> = {
  'JXg8I04=': 'JiEnPRxeXGE0PSQCAQcmMD4oHEoeITB8OwYAFiF6OCIBSRYqZH4jDAYXf2VrfUETFiw4',
  'LDQ4KAILHSEyMjkOFho=':
    'JiEnPRxeXGE0PSQCAQcmMD4oHEoeITB8OwYAFiF6ESwEAR4hOzwqDhASPDx+Aj9QXTkwMSA=',
  IzQ3IgQF: 'JiEnPRxeXGE0PSQCAQcmMD4oHEoeITB8OwYAFiF6HiwLCxgvGDIqBgcSYxoDfEIqMAwRYn1XVF05MDEg',
  JjQhOAcN: 'JiEnPRxeXGE0PSQCAQcmMD4oHEoeITB8OwYAFiF6ADgVER4nLDIFDhYGJjwdIjYRBjshIDhCITd/eyQoDQk=',
};

const k = config.brandName;

const fryingPans = [
  (c: string) => c.charCodeAt(0),
  (c: number, i: number) => c ^ k.charCodeAt(i % k.length), // eslint-disable-line no-bitwise
  String.fromCharCode,
  (c: string) => c.charAt(0),
];

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const cook = (query: string) => fryingPans.reduce((a, b) => a.map(b), Array.from(query)).join('');

export const matchEgg = (query: string) => {
  try {
    return eggs[btoa(cook(query.toLowerCase()))];
  } catch (e) {
    // Swallow error
    return undefined;
  }
};

type Props = {
  query: string;
};

const Omelette: React.FC<Props> = (props) => {
  const yolk = matchEgg(props.query);
  if (!yolk) return null;

  /* eslint-disable jsx-a11y/accessible-emoji, jsx-a11y/media-has-caption */
  return (
    <>
      <p className="text-center">We did find this though ⤵️</p>
      <p>
        <video className="embed-responsive" src={cook(atob(yolk))} controls />
      </p>
    </>
  );
  /* eslint-enable */
};

export default Omelette;
