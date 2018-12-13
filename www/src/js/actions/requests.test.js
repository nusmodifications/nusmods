import { requestAction } from './requests';

describe(requestAction, () => {
  it('should use type as key if two params are provided', () => {
    const action = requestAction('TEST_ACTION', {
      url: 'http://api.example.com',
    });

    expect(action.type).toEqual('TEST_ACTION');
    expect(action.meta.API_REQUEST).toEqual('TEST_ACTION');

    expect(action).toMatchSnapshot();
  });

  it('should use provided key if three params are provided', () => {
    const action = requestAction('TEST_KEY', 'TEST_ACTION', {
      url: 'http://api.example.com',
    });

    expect(action.type).toEqual('TEST_ACTION');
    expect(action.meta.API_REQUEST).toEqual('TEST_KEY');

    expect(action).toMatchSnapshot();
  });
});
