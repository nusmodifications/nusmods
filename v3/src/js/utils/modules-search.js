/* @flow */

import _ from 'lodash';

export class ModulesSearchIndex {

  tokenToUidToDocumentMap: Object;

  constructor() {
    this.tokenToUidToDocumentMap = {};
  }

  indexDocument(token: string, uid: string, document: Object): void {
    if (!this.tokenToUidToDocumentMap[token]) {
      this.tokenToUidToDocumentMap[token] = {};
    }

    this.tokenToUidToDocumentMap[token][uid] = document;
  }

  // eslint-disable-next-line no-unused-vars
  search(tokens: Array<string>, corpus: Array<Object>): Array<Object> {
    const query: string = tokens[0];
    let uidToDocumentMap = this.tokenToUidToDocumentMap[query] || {};

    for (let i = 1, numTokens = tokens.length; i < numTokens; i++) {
      const token = tokens[i];
      const currentUidToDocumentMap = this.tokenToUidToDocumentMap[token] || {};

      uidToDocumentMap = _.pickBy(uidToDocumentMap, (value, key) => {
        return currentUidToDocumentMap[key];
      });
    }

    const lowerCaseQuery: string = query.toLowerCase();
    /*
    First sort based on a case insensitive index of how early
    the query appears.
    If they are the same, sort based on the module code.
    */
    const documents: Array<Object> = _.values(uidToDocumentMap);
    documents.sort((a, b) => {
      const indexOfA = a.label.toLowerCase().indexOf(lowerCaseQuery);
      const indexOfB = b.label.toLowerCase().indexOf(lowerCaseQuery);
      const difference = indexOfA - indexOfB;
      if (difference === 0) {
        return a.value.localeCompare(b.value);
      }
      return difference;
    });
    return documents;
  }
}

export class ModulesTokenizer {
  tokenize(text: string): Array<string> {
    const arrayOfTokens: Array<string> = text
      .split(/[^a-zA-Z0-9\-']+/)
      .filter(str => !!str); // Filter empty tokens
    const codeWithoutPrefix: string = arrayOfTokens[0].replace(/\D+/, '');
    if (codeWithoutPrefix) {
      arrayOfTokens.unshift(codeWithoutPrefix); // Prepend
    }
    return arrayOfTokens;
  }
}
