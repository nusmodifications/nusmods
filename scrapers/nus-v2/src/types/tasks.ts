/**
 * Defines a Task, a wrapper around a chainable method
 */
// eslint-disable-next-line import/prefer-default-export
export interface Task<Input = void, Output = void> {
  // Name of the task
  name: string;

  // Execute the task
  run(input: Input): Promise<Output>;
}
