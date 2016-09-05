import moduleBank from './moduleBank';

export default function entities(state = {}, action) {
  return {
    moduleBank: moduleBank(state.moduleBank, action),
  };
}
