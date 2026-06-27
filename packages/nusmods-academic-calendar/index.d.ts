export type DateTuple = [number, number, number];

export type AcademicCalendar = {
  readonly [acadYear: string]: {
    readonly [semester: string]: { readonly start: DateTuple };
  };
};

export declare const SPECIAL_TERM_SEMESTERS: readonly [3, 4];

export declare const academicCalendar: AcademicCalendar;
export default academicCalendar;

export declare function subtractAcadYear(acadYear: string): string;

export declare function getSemesterStart(acadYear: string, semester: number): Date | null;

export declare function isPreviousAySpecialTermActive(academicYear: string, date?: Date): boolean;

export declare function getEffectiveSpecialTermAcadYear(
  academicYear: string,
  specialTermAcademicYear?: string | null,
  date?: Date,
): string;

export declare function isUsingPreviousAySpecialTermData(
  academicYear: string,
  specialTermAcademicYear?: string | null,
  date?: Date,
): boolean;

export declare function shouldUsePreviousAyForSemester(
  semester: number,
  academicYear: string,
  specialTermAcademicYear?: string | null,
  date?: Date,
): boolean;
