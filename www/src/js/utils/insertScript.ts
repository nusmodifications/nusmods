export default function insertScript(
  src: string,
  options: Partial<HTMLScriptElement> = {},
): Promise<Event> {
  return new Promise((resolve, reject) => {
    const script = window.document.createElement('script');
    script.src = src;

    Object.keys(options).forEach((option) => {
      // @ts-ignore TS doesn't allow us to transfer props this way
      script[option] = options[option];
    });

    script.onload = resolve;
    script.onerror = reject;

    if (window.document.body) {
      window.document.body.appendChild(script);
    }
  });
}
