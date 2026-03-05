import type { ComponentType } from 'react';

function createMockIcon(name: string) {
  const MockComponent = vi.fn(() => <div data-testid={`react-feather ${name} icon`} />);
  (MockComponent as ComponentType).displayName = name;
  return MockComponent;
}

// Create a proxy that returns a mock icon component for any property access
const handler: ProxyHandler<Record<string, ReturnType<typeof createMockIcon>>> = {
  get(target, prop: string) {
    if (typeof prop !== 'string') return undefined;
    if (!(prop in target)) {
      // eslint-disable-next-line no-param-reassign
      target[prop] = createMockIcon(prop);
    }
    return target[prop];
  },
};

const mocks = new Proxy({} as Record<string, ReturnType<typeof createMockIcon>>, handler);

module.exports = mocks;
