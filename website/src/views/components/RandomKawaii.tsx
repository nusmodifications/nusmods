import { FC, HTMLAttributes, useState } from 'react';
import { sample } from 'lodash';
import { SpeechBubble, Mug, Browser, Ghost, KawaiiMood, KawaiiProps } from 'react-kawaii';

type Props = HTMLAttributes<HTMLDivElement> & KawaiiProps;

const icons = [SpeechBubble, Mug, Browser, Ghost];
const defaultMoods: KawaiiMood[] = ['ko', 'sad', 'shocked'];

const RandomKawaii: FC<Props> = ({ size, color = '#FF715D', mood, ...wrapperProps }) => {
  const [Kawaii] = useState(() => sample(icons) ?? icons[0]);
  const [defaultMood] = useState(() => sample(defaultMoods) ?? defaultMoods[0]);
  return (
    <div {...wrapperProps}>
      <Kawaii size={size} color={color} mood={mood || defaultMood} />
    </div>
  );
};

export default RandomKawaii;
