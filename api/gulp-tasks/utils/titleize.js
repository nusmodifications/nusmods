/**
 * NUS specific title case function that accounts for school names, etc.
 */
export default function titleize(str) {
  return str.toLowerCase()
    .replace(/(?:^|\s\(?|-|\/)\S/g, string => string.toUpperCase()) // http://stackoverflow.com/a/7592235
    .replace(/\bIp\b/, 'IP')
    .replace(/\bMit\b/, 'MIT')
    .replace(/^Na$/, 'NA')
    .replace(/\bNus\b/, 'NUS');
}
