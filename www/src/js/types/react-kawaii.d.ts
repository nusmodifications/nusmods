declare module 'react-kawaii' {
  import * as React from 'react';

  export type KawaiiMood =
    | 'sad'
    | 'shocked'
    | 'happy'
    | 'blissful'
    | 'lovestruck'
    | 'excited'
    | 'ko';

  export type KawaiiProps = {
    size?: number;
    color?: string;
    mood?: KawaiiMood;
  };

  export const SpeechBubble: React.FunctionComponent<KawaiiProps>;
  export const Mug: React.FunctionComponent<KawaiiProps>;
  export const Browser: React.FunctionComponent<KawaiiProps>;
  export const Ghost: React.FunctionComponent<KawaiiProps>;
  export const Cat: React.FunctionComponent<KawaiiProps>;
  export const IceCream: React.FunctionComponent<KawaiiProps>;
  export const CreditCard: React.FunctionComponent<KawaiiProps>;
  export const File: React.FunctionComponent<KawaiiProps>;
  export const Backback: React.FunctionComponent<KawaiiProps>;
  export const Planet: React.FunctionComponent<KawaiiProps>;
}
