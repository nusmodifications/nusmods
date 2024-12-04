import Adapter from '@cfaester/enzyme-adapter-react-18';
import { configure } from 'enzyme';
import { setAutoFreeze } from 'immer';

import '@testing-library/jest-dom';

import { TextEncoder } from 'util';

Object.defineProperty(global, 'TextEncoder', {
  value: TextEncoder,
});

configure({ adapter: new Adapter() });

// immer uses Object.freeze on returned state objects, which is incompatible with
// redux-persist. See https://github.com/rt2zz/redux-persist/issues/747
setAutoFreeze(false);
