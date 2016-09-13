export const CHANGE_THEME = 'CHANGE_THEME';
export function changeTheme(theme) {
  return {
    type: CHANGE_THEME,
    payload: {
      theme,
    },
  };
}
