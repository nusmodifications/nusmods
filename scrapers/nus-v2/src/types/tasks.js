// @flow

export interface Task<Input = void, Output = void> {
  // Name of the task
  +name: string;

  // Input from previous tasks in the pipeline
  input: Input;

  // Output to next tasks in the pipeline
  output: Output;

  // Execute the task
  run(): Promise<void>;
}
