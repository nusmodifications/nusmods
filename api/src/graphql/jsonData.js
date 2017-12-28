import R from 'ramda';

import { walkJsonDirSync } from '../util/walkDir';
import mapKeysDeep from '../util/mapKeysDeep';
import config from '../../config';

/**
 * Fetches data from the api folder, and exports it for consumption.
 */
const apiFolder = config.defaults.destFolder;
const modulesFile = config.consolidate.destFileName;

const removeModuleKeys = mapKeysDeep(key => key.replace('Module', ''));
const camelizeAllKeys = mapKeysDeep(key => key.replace(/[A-Z]/, R.toLower));
const indexByModuleCode = R.map(R.indexBy(R.prop('code')));
const processData = R.pipe(removeModuleKeys, camelizeAllKeys, indexByModuleCode);

const data = processData(walkJsonDirSync(apiFolder, modulesFile));

export default data;
