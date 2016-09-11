export class ModulesTokenizer {
  tokenize(text) {
    const arrayOfTokens = text
      .split(/[^a-zA-Z0-9\-']+/)
      .filter(str => !!str); // Filter empty tokens
    const codeWithoutPrefix = arrayOfTokens[0].replace(/\D+/, '');
    if (codeWithoutPrefix) {
      arrayOfTokens.unshift(codeWithoutPrefix); // Prepend
    }
    return arrayOfTokens;
  }
}
