export const TOGGLE_OPTIMIZER_DISPLAY = 'TOGGLE_OPTIMIZER_DISPLAY' as const;
export function toggleOptimizerDisplay() {
  return {
    type: TOGGLE_OPTIMIZER_DISPLAY,
    payload: null,
  };
}
