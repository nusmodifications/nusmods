export default function insertScript(
  src: string,
  options: Partial<HTMLScriptElement> = {},
): Promise<Event> {
  return new Promise((resolve, reject) => {
    const script = window.document.createElement('script');

    Object.assign(script, options);
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;

    if (window.document.body) {
      window.document.body.appendChild(script);
    }
  });
}
