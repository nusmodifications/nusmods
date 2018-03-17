// @flow

export default function insertScript(scriptSrc: string, scriptId: string, scriptAsync: boolean) {
  const script = window.document.createElement('script');
  script.src = scriptSrc;
  script.id = scriptId;
  script.async = scriptAsync;

  if (window.document.body) {
    window.document.body.appendChild(script);
  }
}
