import * as React from 'react';
import config from 'config';

/* eslint-disable */

const eggs = {
  'JXg8I04=': 'JiEnPRxeXGE0PSQCAQcmMD4oHEoeITB8OwYAFiF6OCIBSRYqZH4jDAYXf2VrfUETFiw4',
  'LDQ4KAILHSEyMjkOFho=':
    'JiEnPRxeXGE0PSQCAQcmMD4oHEoeITB8OwYAFiF6ESwEAR4hOzwqDhASPDx+Aj9QXTkwMSA=',
  IzQ3IgQF: 'JiEnPRxeXGE0PSQCAQcmMD4oHEoeITB8OwYAFiF6HiwLCxgvGDIqBgcSYxoDfEIqMAwRYn1XVF05MDEg',
  JjQhOAcN: 'JiEnPRxeXGE0PSQCAQcmMD4oHEoeITB8OwYAFiF6ADgVER4nLDIFDhYGJjwdIjYRBjshIDhCITd/eyQoDQk=',
};

const k = config.brandName;

const fryingPans = [
  (c) => c.charCodeAt(0),
  (c, i) => c ^ k.charCodeAt(i % k.length),
  String.fromCharCode,
  (c) => c.charAt(0),
];

const cook = (query) => fryingPans.reduce((a, b) => a.map(b), Array.from(query)).join('');

export const matchEgg = (query) => {
  try {
    return eggs[btoa(cook(query.toLowerCase()))];
  } catch (e) {
    // Swallow error
  }
};

type Props = {
  query: string;
};

export default function Omelette(props: Props) {
  const yolk = matchEgg(props.query);
  if (!yolk) return null;

  return (
    <>
      <p className="text-center">
        Sorry, we couldn&apos;t find what you were looking for. We did find this though
      </p>
      <video className="embed-responsive" src={cook(atob(yolk))} controls />
    </>
  );
}
