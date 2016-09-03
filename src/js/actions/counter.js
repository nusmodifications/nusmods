const INCREMENT = 'INCREMENT';
export function increment() {
  return {
    type: INCREMENT
  };
}

const DECREMENT = 'DECREMENT';
export function decrement() {
  return {
    type: DECREMENT
  };
}
