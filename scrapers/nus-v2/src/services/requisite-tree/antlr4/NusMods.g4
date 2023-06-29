grammar NusMods;
options {
	language=TypeScript;
}

overall: | program_types THEN compound EOF;

program_types:
	PROGRAM_TYPES (IF_IN | must_be_in) PROGRAM_TYPES_VALUE;

compound:
	| '(' compound ')'
    | binop
	| op;

binop: 
    | op boolean_expr compound;

boolean_expr: AND | OR;

op: '(' binop ')' | primitive;

primitive:
	| programs
	| plan_types
	| cohort_years
	| subject_years
	| special
	| prereq
    | coreq;

programs:
	PROGRAMS programs_condition programs_values;

programs_condition: IF_IN | IF_NOT_IN | must_be_in | must_not_be_in;

programs_values: PROGRAMS_VALUE (COMMA PROGRAMS_VALUE)*;

plan_types:
	PLAN_TYPES plan_types_condition programs_values;

plan_types_condition: IF_IN | IF_NOT_IN | must_be_in | must_not_be_in;

cohort_years:
	COHORT_YEARS (
		IF_IN
		| IF_NOT_IN
		| must_be_in
		| must_not_be_in
	) YEARS;

subject_years: SUBJECT_YEARS IF_IN YEARS YEARS;

special:
	SPECIAL special_condition '"' SPECIAL_VALUE '"';

special_condition: IF_IN | IF_NOT_IN | must_be_in | must_not_be_in;

prereq:
    | courses
	| SUBJECTS contains_number programs_values
	| UNITS contains_number
	| GPA contains_number;

coreq:
    | COREQUISITE '(' courses ')'
    | COREQUISITE courses;

courses: COURSES contains_number course_items;

course_items: PROGRAMS_VALUE (COMMA PROGRAMS_VALUE)*;

// Statements

must_be_in: MUST_BE_IN contains_number?;
must_not_be_in: MUST_NOT_BE_IN contains_number?;

contains_number: '(' NUMBER ')';

// TOKENS

COMMA: ',';
LPAREN: '(';
RPAREN: ')';

// Statements

IF_IN: 'IF_IN';
MUST_BE_IN: 'MUST_BE_IN';
IF_NOT_IN: 'IF_NOT_IN';
MUST_NOT_BE_IN: 'MUST_NOT_BE_IN';
THEN: 'THEN';
AND: 'AND';
OR: 'OR';

// Constraints

PROGRAM_TYPES: 'PROGRAM_TYPES' | 'PROGRAMME_TYPES';
PROGRAM_TYPES_VALUE:
	'Undergraduate Degree'
	| 'Graduate Degree Coursework'
	| 'Graduate Degree Research'
	| 'CPE (Certificate)';

PROGRAMS: 'PROGRAMS';

PLAN_TYPES:
	'Minor'
	| '2nd Major'
	| 'Specialisation'
	| 'Special Programme'
	| 'Track';
COHORT_YEARS: 'COHORT_YEARS';

SUBJECT_YEARS: 'SUBJECT_YEARS';

SPECIAL: 'SPECIAL';

SPECIAL_VALUE:
	'ACAD_LEVEL=1'
	| 'ACAD_LEVEL=1-2'
	| 'ACAD_LEVEL=1-2-3'
	| 'ACAD_LEVEL=1-2-3-4'
	| 'ACAD_LEVEL=2'
	| 'ACAD_LEVEL=2-3'
	| 'ACAD_LEVEL=2-3-4'
	| 'ACAD_LEVEL=3'
	| 'ACAD_LEVEL=3-4'
	| 'ACAD_LEVEL=4';

// Prerequisite

COURSES: 'COURSES' | 'MODULES';
SUBJECTS: 'SUBJECTS';
UNITS: 'UNITS';
GPA: 'GPA' | 'CAP';

// Corequisite
COREQUISITE: 'COREQUISITE';

// General
QUOTE: '"';
NUMBER: [0-9.]+;
YEARS: [SE] [:] [ ]? ID;
PROGRAMS_VALUE: ID;
fragment ID: [0-9a-zA-Z_%:]+;

WS: [ \n\t\r]+ -> skip;


