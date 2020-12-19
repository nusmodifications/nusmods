// Mock React's internal scheduler so that tests run in Concurrent Mode.
// Although this is the current recommendation (and is used at Facebook), the
// recommended approach is likely to change in the future. See:
// - https://github.com/facebook/react/blob/ce40f1dc2f8e0869ae4b484e7248a449efba64c8/packages/react-reconciler/src/ReactFiberWorkLoop.old.js#L3357-L3363
// - https://github.com/testing-library/react-testing-library/issues/509#issuecomment-557578615
//
// scheduler is a React internal dependency. This is not added as a dev
// dependency to avoid version desync with the version depended on by React.
// eslint-disable-next-line import/no-extraneous-dependencies, global-require, no-undef
jest.mock('scheduler', () => require('scheduler/unstable_mock'));
