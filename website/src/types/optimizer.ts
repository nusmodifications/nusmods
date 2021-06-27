// User-selected constraints to pass to optimizer
export interface GlobalConstraintsList {
    // Min/max number of MCs + whether the constraint is active
    workloadActive: boolean;
    minWorkload: number;
    maxWorkload: number;
    // Find exactly N free days + whether the constraint is active
    freeDayActive: boolean;
    numRequiredFreeDays: number;
    // Force these exact free days + whether the constraint is active
    specificFreeDaysActive: boolean;
    specificFreeDays: Array<string>;
    // When lessons should start and end + whether the constraint is active
    timeConstraintActive: boolean;
    startTime: string;
    endTime: string;
    // The hours where a lunch break should be allocated,
    //  how many half-hour slots to allocate, and whether the constraint is active
    lunchStart: string;
    lunchEnd: string;
    lunchHalfHours: number;
    lunchBreakActive: boolean;
    // Ask optimizer to compact timetable to leave as few gaps between lessons as possible
    preferCompactTimetable: boolean;
}

// TODO Shouldn't be here
export const defaultConstraints: GlobalConstraintsList = {
    workloadActive: false,
    minWorkload: 0,
    maxWorkload: 30,
    freeDayActive: false,
    numRequiredFreeDays: 1,
    specificFreeDaysActive: false,
    specificFreeDays: [],
    startTime: '0800',
    endTime: '2200',
    lunchStart: '1100',
    lunchEnd: '1500',
    lunchHalfHours: 2,
    lunchBreakActive: false,
    timeConstraintActive: false,
    preferCompactTimetable: false,
};
