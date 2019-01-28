// @flow

export const dayTextMap = {
  '1': 'Monday',
  '2': 'Tuesday',
  '3': 'Wednesday',
  '4': 'Thursday',
  '5': 'Friday',
  '6': 'Saturday',
  // Assume lessons on Sunday are invalid
};

export const activityLessonTypeMap = {
  // Recognized by frontend
  B: 'Laboratory',
  L: 'Lecture',
  D: 'Design Lecture',
  R: 'Recitation',
  P: 'Packaged Lecture',
  X: 'Packaged Tutorial',
  W: 'Workshop',
  E: 'Seminar-Style Module Class',
  S: 'Sectional Teaching',
  T: 'Tutorial',
  '2': 'Tutorial Type 2',
  '3': 'Tutorial Type 3',

  // Not recognized by frontend
  '4': 'Tutorial Type 4',
  '5': 'Tutorial Type 5',
  '6': 'Tutorial Type 6',
  '7': 'Tutorial Type 7',
  '8': 'Tutorial Type 8',
  '9': 'Tutorial Type 9',
  A: 'Supervision of Academic Exercise',
  O: 'Others',
  V: 'Lecture On Demand',
  I: 'Independent Study Module',
  C: 'Bedside Tutorial',
  M: 'Ensemble Teaching',
  J: 'Mini-Project',
};
