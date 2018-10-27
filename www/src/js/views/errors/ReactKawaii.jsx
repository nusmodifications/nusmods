// @flow
import React, { PureComponent } from 'react';
import { Planet, SpeechBubble, Mug, Browser, Ghost } from 'react-kawaii';

type Props = {};
// Use PureComponent as the icon should not change
// eslint-disable-next-line react/prefer-stateless-function
export default class ReactKawaii extends PureComponent<Props> {
  render() {
    const icons = [Planet, SpeechBubble, Mug, Browser, Ghost];
    const Kawaii = icons[Math.floor(Math.random() * icons.length)];
    return <Kawaii size={100} mood="sad" color="#FF715D" />;
  }
}
