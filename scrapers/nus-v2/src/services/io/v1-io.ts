import path from 'path';
import * as fs from 'fs-extra';
import config from '../../config';

export default class V1DataReader {
  protected readonly academicYear: string;

  constructor(academicYear: string) {
    this.academicYear = academicYear;
  }

  private basePath() {
    return path.join(config.dataPath, 'v1', this.academicYear.replace('/', '-'), 'modules');
  }

  async listModules() {
    const dir = this.basePath();
    const files = await fs.readdir(dir);
    return files
      .map((file) => path.parse(file).name)
      .filter((name) => name.match(/[A-Z]{2,3}[0-9]{4}[A-Z]{0,3}/));
  }

  async getModule(moduleCode: string) {
    const filepath = path.join(this.basePath(), `${moduleCode}.json`);
    return fs.readJSON(filepath);
  }
}
