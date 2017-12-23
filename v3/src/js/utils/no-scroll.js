// @flow

import noScroll from 'no-scroll';

/**
 * Wrapper around the simple no-scroll package that also toggles a
 * class on body because unfortunately toggling the no scroll styles
 * also affects position: sticky elements
 */
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
