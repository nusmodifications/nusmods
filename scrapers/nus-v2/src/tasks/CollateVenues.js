// @flow
import { merge } from 'lodash';
import BaseTask from './BaseTask';
import type { Task } from '../types/tasks';
import type { Semester } from '../types/modules';
import type { SemesterModuleData } from '../types/mapper';
import type { VenueInfo } from '../types/venues';

import config from '../config';
import { extractVenueAvailability } from '../services/mapper';

type Input = SemesterModuleData[];
type Output = VenueInfo;

export default class CollateVenues extends BaseTask implements Task<Input, Output> {
  semester: Semester;
  academicYear: string;

  logger = this.rootLogger.child({
    task: CollateVenues.name,
    year: this.academicYear,
    semester: this.semester,
  });

  get name() {
    return `Collating venues for semester ${this.semester}`;
  }

  constructor(semester: Semester, academicYear: string = config.academicYear) {
    super();

    this.semester = semester;
    this.academicYear = academicYear;
  }

  async run(input: Input) {
    this.logger.info(`Collating venues for ${this.academicYear} semester ${this.semester}`);

    let venues = {};
    input.forEach((module) => {
      // Extract availability for each module and merge the result back into venues
      const availability = extractVenueAvailability(
        module.ModuleCode,
        module.SemesterData.Timetable,
      );

      venues = merge(venues, availability);
    });

    // Save the results
    await Promise.all([
      this.fs.output.venueInformation(this.semester).write(venues),
      this.fs.output.venueList(this.semester).write(Object.keys(venues)),
    ]);

    return venues;
  }
}
