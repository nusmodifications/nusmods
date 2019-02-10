type ScriptOptions = {
  id?: string;
  async?: boolean;
  defer?: boolean;
};

export default function insertScript(src: string, options: ScriptOptions = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const script = window.document.createElement('script');
    script.src = src;

    Object.keys(options).forEach((option) => {
      script[option] = options[option];
    });

    script.onload = resolve;
    script.onerror = reject;

    if (window.document.body) {
      window.document.body.appendChild(script);
    }
  });
}
