// @flow
import React, { PureComponent, type ComponentType } from 'react';
import { Planet, SpeechBubble, Mug, Browser, Ghost } from 'react-kawaii';

type Props = {
  size?: number,
  mood?: string,
  color?: string,
  title?: string,
  'aria-label'?: string,
};

class RandomKawaii extends PureComponent<Props> {
  kawaii: ComponentType;
  constructor() {
    super();
    const icons = [Planet, SpeechBubble, Mug, Browser, Ghost];
    this.kawaii = icons[Math.floor(Math.random() * icons.length)];
  }
  render() {
    const { size, mood, color } = this.props;
    const Kawaii = this.kawaii;
    return <Kawaii size={size} mood={mood} color={color} />;
  }
}

export default RandomKawaii;
