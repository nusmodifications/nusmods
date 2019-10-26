/**
 * Defines a Task, a wrapper around a chainable method. Input and Output
 * represents the parameters and return value of the run function respectively.
 * Think of them as the input and output in a pipe. Constructor parameters
 * can optionally be used to parameterize tasks, such as with acard year and
 * semester.
 */
// eslint-disable-next-line import/prefer-default-export
export interface Task<Input = void, Output = void> {
  // Name of the task
  readonly name: string;

  // Execute the task
  run(input: Input): Promise<Output>;
}
