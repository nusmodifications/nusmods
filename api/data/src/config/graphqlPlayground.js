const hours = new Date().getHours();
const isDayTime = hours >= 6 && hours <= 18;

export default {
  settings: {
    'editor.theme': isDayTime ? 'light' : 'dark',
    'editor.cursorShape': 'underline',
    'tracing.hideTracingResponse': false,
  },
};
