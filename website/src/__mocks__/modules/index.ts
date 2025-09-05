import type { Module } from 'types/modules';

import ACC2002_JSON from './ACC2002.json';
import BFS1001_JSON from './BFS1001.json';
import CP3880_JSON from './CP3880.json';
import CS1010A_JSON from './CS1010A.json';
import CS1010S_JSON from './CS1010S.json';
import CS3216_JSON from './CS3216.json';
import CS4243_JSON from './CS4243.json';
import GES1021_JSON from './GES1021.json';
import PC1222_JSON from './PC1222.json';
import GER1000_JSON from './GER1000.json';

// Have to cast these as Module explicitly, otherwise TS will try to
// incorrectly infer the shape from the JSON - specifically Weeks will
// not be cast correctly
export const ACC2002: Module = { ...ACC2002_JSON, timestamp: 1572843950000 };
export const BFS1001: Module = { ...BFS1001_JSON, timestamp: 1572843950000 };
export const CP3880: Module = { ...CP3880_JSON, timestamp: 1572843950000 };
export const CS1010A: Module = { ...CS1010A_JSON, timestamp: 1572843950000 };
export const CS1010S: Module = { ...CS1010S_JSON, timestamp: 1572843950000 };
export const CS3216: Module = { ...CS3216_JSON, timestamp: 1572843950000 };
export const CS4243: Module = { ...CS4243_JSON, timestamp: 1572843950000 };
export const GES1021: Module = { ...GES1021_JSON, timestamp: 1572843950000 };
export const PC1222: Module = { ...PC1222_JSON, timestamp: 1572843950000 };
export const GER1000: Module = { ...GER1000_JSON, timestamp: 1572843950000 };

const modules: Module[] = [ACC2002, BFS1001, CS1010S, CS3216, GES1021, PC1222, CS1010A];
export default modules;
