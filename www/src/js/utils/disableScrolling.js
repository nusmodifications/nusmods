// @flow

import noScrollNpm from 'no-scroll';

let isOn = false;

/**
 * Wrapper around the simple no-scroll package that also toggles a
 * class on body because unfortunately toggling the no scroll styles
 * also affects position: sticky elements
 */
export default function disableScrolling(active: boolean) {
  const { body } = document;
  if (!body || active === isOn) return;

  noScrollNpm.toggle();
  body.classList.toggle('no-scroll');
  isOn = !isOn;
}
