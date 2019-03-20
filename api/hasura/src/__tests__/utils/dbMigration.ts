import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { Client } from 'pg';

const afs = {
  readdir: promisify(fs.readdir),
  readFile: promisify(fs.readFile),
};

async function getMigrationFiles(filenameEnd: string) {
  const migrationsPath = path.resolve(__dirname, '../../../migrations');
  const dir: fs.Dirent[] = await afs.readdir(migrationsPath, { withFileTypes: true });
  const migrationFilePaths = dir
    .filter((dirent) => dirent.isFile() && dirent.name.endsWith(filenameEnd))
    .map((file) => path.join(migrationsPath, file.name));
  const migrationFiles = migrationFilePaths.map((filePath) => afs.readFile(filePath, 'utf-8'));

  return Promise.all(migrationFiles);
}

async function runMigrationFiles(client: Client, variant: 'up' | 'down') {
  const upSqlQueries = await getMigrationFiles(`${variant}.sql`);

  try {
    await client.query('BEGIN');

    for await (const upSqlQuery of upSqlQueries) {
      await client.query(upSqlQuery);
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  }
}

function up(client: Client) {
  return runMigrationFiles(client, 'up');
}

function down(client: Client) {
  return runMigrationFiles(client, 'down');
}

export default {
  up,
  down,
};
