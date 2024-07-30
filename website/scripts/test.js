import Adapter from '@cfaester/enzyme-adapter-react-18';

const { configure } = require('enzyme');
const { setAutoFreeze } = require('immer');
require('@testing-library/jest-dom');

configure({ adapter: new Adapter() });

// immer uses Object.freeze on returned state objects, which is incompatible with
// redux-persist. See https://github.com/rt2zz/redux-persist/issues/747
setAutoFreeze(false);
