import basex from 'base-x';

// https://en.wikipedia.org/wiki/Base58
const BASE_58_CHARACTERS = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const base58 = basex(BASE_58_CHARACTERS);

export default base58;
