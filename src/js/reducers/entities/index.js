import moduleList from './moduleList';
// import modules from './modules';

export default function entities(state = {}, action) {
  return {
    moduleList: moduleList(state.moduleList, action),
    // modules: modules(state.modules, action),
  };
}
