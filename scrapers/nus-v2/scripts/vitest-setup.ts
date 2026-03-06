// Always mock config since on CI the env file does not exist. Also ensures
// the keys don't get inadvertently invoked during tests.
vi.mock('../src/config.ts');

// Mock fs-extra globally to prevent tests from writing to the real filesystem.
// Previously handled by Jest's __mocks__/fs-extra.ts auto-mock.
// The factory returns stub functions so that calls like fs.outputJSON() don't throw.
vi.mock('fs-extra', () => ({
  default: {},
  outputJSON: vi.fn().mockResolvedValue(undefined),
  readJSON: vi.fn().mockResolvedValue(undefined),
  readdir: vi.fn().mockResolvedValue([]),
  remove: vi.fn().mockResolvedValue(undefined),
  pathExists: vi.fn().mockResolvedValue(false),
  stat: vi.fn().mockImplementation(() => Promise.resolve({ mtimeMs: Date.now() })),
}));
