import * as fs from 'fs-extra';
import path from 'path'

export default class V1DataReader {
  protected readonly academicYear: string;

  constructor(academicYear: string) {
    this.academicYear = academicYear;
  }

  async listModules() {
    const dir = `${this.academicYear}/modules`;
    const files = await fs.readdir(dir);
    return files.map(file => path.parse(file).name);
  }

  async getModule(moduleCode: string) {
    const filepath = `${this.academicYear}/modules/${moduleCode}.json`;
    return fs.readJSON(filepath);
  }
}
