import type { MpePreference } from '../../types/mpe';
import UpdatePreferenceQueue from './UpdatePreferenceQueue';

describe(UpdatePreferenceQueue, () => {
  const preference: MpePreference = {
    moduleTitle: 'Programming Methodology',
    moduleCode: 'CS1010',
    moduleCredits: 4,
    moduleType: '01',
  };

  it('should limit concurrently calls to update', async () => {
    const update = jest.fn().mockResolvedValue(undefined);
    const queue = new UpdatePreferenceQueue(update);

    queue.update([]);
    queue.update([preference]);
    queue.update([]);
    await queue.update([preference, preference]);

    expect(update.mock.calls).toEqual([[[]], [[preference, preference]]]);
  });

  it('should rethrow last error', async () => {
    let rejections = 0;
    const update = jest.fn().mockImplementation(() => {
      rejections += 1;
      return Promise.reject(new Error(String(rejections)));
    });

    const queue = new UpdatePreferenceQueue(update);

    queue.update([]);
    queue.update([preference]);
    queue.update([]);
    await expect(queue.update([preference, preference])).rejects.toThrow('2');
  });
});
