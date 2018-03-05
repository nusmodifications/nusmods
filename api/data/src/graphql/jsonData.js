import R from 'ramda';

import { walkJsonDirSync } from '../util/walkDir';
import mapKeysDeep from '../util/mapKeysDeep';
import config from '../../config';

/**
 * Fetches data from the data folder, and exports it for consumption.
 */
const { dataFolder, modulesFileName } = config;

const removeModuleKeys = mapKeysDeep((key) => key.replace('Module', ''));
const camelizeAllKeys = mapKeysDeep((key) => key.replace(/[A-Z]/, R.toLower));
const indexByModuleCode = R.map(R.indexBy(R.prop('code')));
const processData = R.pipe(removeModuleKeys, camelizeAllKeys, indexByModuleCode);

const data = processData(walkJsonDirSync(dataFolder, modulesFileName));

export default data;
