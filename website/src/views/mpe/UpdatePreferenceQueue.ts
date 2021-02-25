/* eslint-disable max-classes-per-file */
import PQueue, { Queue } from 'p-queue';
import { MpePreference } from '../../types/mpe';

class SingleItemQueue<Element> implements Queue<Element, void> {
  private item: Element | undefined;

  dequeue(): Element | undefined {
    const { item } = this;
    this.item = undefined;
    return item;
  }

  enqueue(run: Element): void {
    this.item = run;
  }

  filter(): Element[] {
    return this.item === undefined ? [] : [this.item];
  }

  get size() {
    return this.item === undefined ? 0 : 1;
  }
}

export default class UpdatePreferenceQueue {
  private lastError: Error | undefined;

  private queue = new PQueue<SingleItemQueue<() => Promise<unknown>>>({
    queueClass: SingleItemQueue,
    concurrency: 1,
  });

  constructor(private readonly updatePreference: (preferences: MpePreference[]) => Promise<void>) {}

  update(preferences: MpePreference[]) {
    this.queue.add(() =>
      this.updatePreference(preferences).then(
        () => {
          this.lastError = undefined;
        },
        (e) => {
          this.lastError = e;
        },
      ),
    );

    return this.queue.onIdle().then(() => {
      if (this.lastError) {
        throw this.lastError;
      }
    });
  }
}
