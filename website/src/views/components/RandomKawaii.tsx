import React from 'react';
import { sample } from 'lodash';
import { SpeechBubble, Mug, Browser, Ghost, KawaiiMood, KawaiiProps } from 'react-kawaii';

type Props = {
  size?: number;
  mood?: KawaiiMood;
  color?: string;
  title?: string;
  'aria-label'?: string;
};

const icons = [SpeechBubble, Mug, Browser, Ghost];
const defaultMoods: KawaiiMood[] = ['ko', 'sad', 'shocked'];

class RandomKawaii extends React.PureComponent<Props> {
  kawaii: React.ComponentType<KawaiiProps>;

  defaultMood: KawaiiMood;

  static defaultProps = {
    mood: null,
    color: '#FF715D',
  };

  constructor(props: Props) {
    super(props);

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    this.kawaii = sample(icons)!;
    this.defaultMood = sample(defaultMoods)!;
    /* eslint-enable */
  }

  render() {
    const { size, mood, color, ...wrapperProps } = this.props;
    const Kawaii = this.kawaii;
    const moodProp = mood || this.defaultMood;

    return (
      <div {...wrapperProps}>
        <Kawaii size={size} mood={moodProp} color={color} />
      </div>
    );
  }
}

export default RandomKawaii;
