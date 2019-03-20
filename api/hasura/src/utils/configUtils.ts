import assert from 'assert';

function getEnv(key: string): string {
  const val = process.env[key];
  if (val) {
    return val;
  }
  return assert.fail(
    `Expected non-empty string for environment variable ${key}, invalid value "${val}" encountered`,
  );
}

const keys = ['claims_namespace', 'key', 'type'];
export type SecretEnv = { claims_namespace: string; key: string; type: string };
function getSecretEnv(key: string): SecretEnv {
  try {
    const val = getEnv(key);
    const json = JSON.parse(val);

    if (json == null || typeof json !== 'object' || Array.isArray(json)) {
      return assert.fail(
        `Expected object for environment variable ${key}, invalid value "${val}" encountered`,
      );
    }

    const invalidKeys = keys.filter((key) => !json[key]);
    if (invalidKeys.length > 0) {
      const invalidKeysStr = invalidKeys.join(', ');
      return assert.fail(
        `Expected non-empty strings for keys ${invalidKeysStr}, invalid value "${val}" encountered`,
      );
    }

    return json;
  } catch (error) {
    return assert.fail(error);
  }
}

export default {
  getEnv,
  getSecretEnv,
};
