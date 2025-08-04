import { FC, HTMLAttributes, memo, useState } from 'react';
import { sample } from 'lodash';
import { SpeechBubble, Mug, Browser, Ghost, KawaiiProps } from 'react-kawaii';

type Props = HTMLAttributes<HTMLDivElement> & KawaiiProps;

const icons = [SpeechBubble, Mug, Browser, Ghost];
const defaultMoods: KawaiiProps['mood'][] = ['ko', 'sad', 'shocked'];

const RandomKawaii: FC<Props> = ({ size, color = '#FF715D', mood, ...wrapperProps }) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [Kawaii] = useState(() => sample(icons)!);
  const [defaultMood] = useState(() => sample(defaultMoods));

  return (
    <div {...(wrapperProps as HTMLAttributes<HTMLDivElement>)}>
      <Kawaii size={size} color={color} mood={mood || defaultMood} />
    </div>
  );
};

export default memo(RandomKawaii);
