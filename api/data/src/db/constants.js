/**
 * Lookups from tables (camelCase) to tables (snake_case)
 */
const TABLES = {
  schools: 'schools',
  terms: 'terms',
  departments: 'departments',
  venues: 'venues',
  courses: 'courses',
  lessons: 'lessons',
};

/**
 * Lookups from columns (camelCase) to columns (snake_case)
 */
const COLUMNS = {
  altitude: 'altitude',
  code: 'code',
  corequisite: 'corequisite',
  courseId: 'course_id',
  createdAt: 'created_at',
  day: 'day',
  departmentId: 'department_id',
  description: 'description',
  endsAt: 'ends_at',
  floor: 'floor',
  id: 'id',
  lat: 'lat',
  lessonId: 'lesson_id',
  lng: 'lng',
  longName: 'long_name',
  name: 'name',
  preclusion: 'preclusion',
  prerequisite: 'prerequisite',
  schoolId: 'school_id',
  shortName: 'short_name',
  startsAt: 'starts_at',
  termId: 'term_id',
  title: 'title',
  type: 'type',
  updatedAt: 'updated_at',
  value: 'value',
  venueId: 'venue_id',
  week: 'week',
  workload: 'workload',
};

/**
 * Lookups from enum (camelCase) to enum (snake_case)
 */
const ENUMS = {
  days: 'days_enum',
};

/**
 * Lookups from table (camelCase) to foreign key (snake_case)
 */
const TABLE_TO_FOREIGN_KEYS = {
  schools: COLUMNS.schoolId,
  terms: COLUMNS.termId,
  departments: COLUMNS.departmentId,
  venues: COLUMNS.venueId,
  courses: COLUMNS.courseId,
  lessons: COLUMNS.lessonId,
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

module.exports = {
  TABLES,
  COLUMNS,
  ENUMS,
  TABLE_TO_FOREIGN_KEYS,
  DAYS,
};
