import { expect } from 'chai';
import * as actions from '../src/js/actions/moduleBank';

describe('moduleBank', () => {
  it('fetchModuleList should dispatch a request', () => {
    expect(actions.fetchModuleList()).to.be.a('function');
  });

  it('fetchModule should dispatch a request', () => {
    expect(actions.fetchModule()).to.be.a('function');
  });

  it('loadModule should dispatch a request', () => {
    expect(actions.loadModule('test')).to.be.a('function');
  });
});
