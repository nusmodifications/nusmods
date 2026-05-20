export type DateTuple = [number, number, number];

export type AcademicCalendar = {
  readonly [acadYear: string]: {
    readonly [semester: string]: { readonly start: DateTuple };
  };
};

export declare const academicCalendar: AcademicCalendar;
export default academicCalendar;

export declare function subtractAcadYear(acadYear: string): string;

export declare function getSemesterStart(acadYear: string, semester: number): Date | null;

export declare function isPreviousAySt2Active(academicYear: string, date?: Date): boolean;

export declare function getEffectiveSt2AcadYear(
  academicYear: string,
  specialTermAcademicYear?: string | null,
  date?: Date,
): string;

export declare function isUsingPreviousAySt2Data(
  academicYear: string,
  specialTermAcademicYear?: string | null,
  date?: Date,
): boolean;
