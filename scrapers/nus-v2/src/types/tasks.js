// @flow

/**
 * Defines a Task, a wrapper around a chainable method
 */
export interface Task<Input = void, Output = void> {
  // Name of the task
  +name: string;

  // Execute the task
  run(input: Input): Promise<Output>;
}
