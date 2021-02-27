import type { MpeSubmission, MpePreference } from '../../types/mpe';
import UpdateSubmissionQueue from './UpdateSubmissionQueue';

describe(UpdateSubmissionQueue, () => {
  const preference: MpePreference = {
    moduleTitle: 'Programming Methodology',
    moduleCode: 'CS1010',
    moduleType: '01',
  };

  const emptySubmission: MpeSubmission = {
    intendedMCs: 0,
    preferences: [],
  };

  const submission: MpeSubmission = {
    intendedMCs: 20,
    preferences: [preference],
  };

  it('should limit concurrently calls to update', async () => {
    const update = jest.fn().mockResolvedValue(undefined);
    const queue = new UpdateSubmissionQueue(update);

    queue.update(emptySubmission);
    queue.update(submission);
    queue.update(emptySubmission);
    await queue.update({ ...submission, preferences: [preference, preference] });

    expect(update.mock.calls).toEqual([
      [emptySubmission],
      [{ ...submission, preferences: [preference, preference] }],
    ]);
  });

  it('should rethrow last error', async () => {
    let rejections = 0;
    const update = jest.fn().mockImplementation(() => {
      rejections += 1;
      return Promise.reject(new Error(String(rejections)));
    });

    const queue = new UpdateSubmissionQueue(update);

    queue.update(emptySubmission);
    queue.update(submission);
    queue.update(emptySubmission);
    await expect(
      queue.update({ ...submission, preferences: [preference, preference] }),
    ).rejects.toThrow('2');
  });
});
