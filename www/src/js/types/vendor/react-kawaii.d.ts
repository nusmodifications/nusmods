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

  export const SpeechBubble: React.ComponentType<KawaiiProps>;
  export const Mug: React.ComponentType<KawaiiProps>;
  export const Browser: React.ComponentType<KawaiiProps>;
  export const Ghost: React.ComponentType<KawaiiProps>;
  export const Cat: React.ComponentType<KawaiiProps>;
  export const IceCream: React.ComponentType<KawaiiProps>;
  export const CreditCard: React.ComponentType<KawaiiProps>;
  export const File: React.ComponentType<KawaiiProps>;
  export const Backback: React.ComponentType<KawaiiProps>;
  export const Planet: React.ComponentType<KawaiiProps>;
}
