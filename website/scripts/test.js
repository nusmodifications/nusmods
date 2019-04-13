const { configure } = require('enzyme');
const { setAutoFreeze } = require('immer');
const Adapter = require('enzyme-adapter-react-16');

configure({ adapter: new Adapter() });

// immer uses Object.freeze on returned state objects, which is incompatible with
// redux-persist. See https://github.com/rt2zz/redux-persist/issues/747
setAutoFreeze(false);
