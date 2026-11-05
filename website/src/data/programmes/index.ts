import { Programme, ProgrammeMap } from 'types/programmes';

import csFocusAreas from './cs-focus-areas';
import socMinors from './soc-minors';

// Community-maintained programme requirement data. Each programme records
// the official page it was transcribed from (source) and when it was last
// checked (lastVerified). To add a programme, create or extend a file in
// this folder and merge it here.
const programmes: ProgrammeMap = {
  ...csFocusAreas,
  ...socMinors,
};

export const programmeList: Programme[] = Object.values(programmes).sort(
  (a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name),
);

export default programmes;
