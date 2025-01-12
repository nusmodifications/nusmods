import type { CommonWrapper } from 'enzyme';
import { act } from '@testing-library/react';

// Hack to get Enzyme to work with React 18
// Source: https://github.com/enzymejs/enzyme/issues/2524
// TODO: Replace Enzyme entirely along with this hack.
export const waitForComponentToPaint = async (wrapper?: CommonWrapper): Promise<void> => {
  await act(async () => {
    await new Promise<void>((resolve) => {
      window.setTimeout(() => {
        /*
         * Make sure it is the last task in the queue.
         * https://dmitripavlutin.com/javascript-promises-settimeout/
         */
        window.setTimeout(resolve, 1);
      }, 1);
    });
  });
  wrapper?.update();
};
