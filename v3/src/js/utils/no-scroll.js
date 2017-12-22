// @flow

import noScroll from 'no-scroll';

export default function (active: boolean) {
  const { body } = document;
  if (!body) return;

  if (active) {
    noScroll.on();
    body.classList.add('no-scroll');
  } else {
    noScroll.off();
    body.classList.remove('no-scroll');
  }
}
