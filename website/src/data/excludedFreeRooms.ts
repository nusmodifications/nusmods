/**
 * This file contains a list of rooms that should be excluded from the
 * "Find Free Rooms" feature.
 *
 * These are rooms that typically are used for other purposes, but very
 * occassionally have timetabled lessons. We do not want students to visit these
 * rooms because of the free rooms feature and find themselves in awkward
 * situations where they need to be chased out of the room.
 */

const excludedFromFreeRooms = new Set<string>([
  // Dept Meeting Room (CNM) - Requested by Dept Staff to Delist from Free Rooms
  'AS6-0333',
  // Play Room (CNM) - Requested by Dept Staff to Delist from Free Rooms
  'AS6-0338',
  // Metaverse Foundry (SoC)
  'COM3-B1-11',
  // Makers@SoC (SoC)
  'COM3-01-19',
]);

export default excludedFromFreeRooms;
