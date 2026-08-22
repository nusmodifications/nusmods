import { mapValues, omit } from 'lodash-es';
import { captureException } from 'utils/error';

/**
 * Each member in the redux-persist data is stringified, and the entire map is stringified\
 * Redux-remember format stringifies the data without stringifying each member\
 * This function takes the redux-persist JSON string and converts it to the redux-remember data format\
 * @param persistJsonString
 * @returns parsed data
 */
const migratePersistToRemember = (persistJsonString: string): any => {
  try {
    const parsedValue = JSON.parse(persistJsonString);
    const data = omit(parsedValue, '_persist');
    return mapValues(data, JSON.parse);
  } catch (error) {
    captureException(error);
    return null;
  }
};

export default migratePersistToRemember;
