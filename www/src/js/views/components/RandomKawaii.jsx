// @flow
import React from 'react';
import { Planet, SpeechBubble, Mug, Browser, Ghost } from 'react-kawaii';

type Props = {
  Kawaii: Component,
  size?: int,
  mood?: string,
  color?: string,
  title?: int,
  'aria-label'?: int,
};

function RandomKawaii(props: Props) {
  return (
    <div aria-label={props['aria-label']} title={props.title}>
      <props.Kawaii size={props.size} mood={props.mood} color={props.color} />
    </div>
  );
}

const icons = [Planet, SpeechBubble, Mug, Browser, Ghost];
RandomKawaii.defaultProps = {
  Kawaii: icons[Math.floor(Math.random() * icons.length)],
};

export default RandomKawaii;
