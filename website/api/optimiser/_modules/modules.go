package modules

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"

	client "github.com/nusmodifications/nusmods/website/api/optimiser/_client"
	constants "github.com/nusmodifications/nusmods/website/api/optimiser/_constants"
	models "github.com/nusmodifications/nusmods/website/api/optimiser/_models"
)

// GetAllModuleSlots gets all module slots that pass conditions in optimiserRequest for all modules.
// Reduces search space by merging slots of the same lesson type happening at the same day and time and building.
func GetAllModuleSlots(
	optimiserRequest *models.OptimiserRequest,
) (models.ModuleTimetableMap, models.ModuleDefaultSlotsMap, map[string]struct{}, error) {
	venues, err := getVenues()
	if err != nil {
		return nil, nil, nil, err
	}

	recordingsMap := make(map[string]struct{}, len(optimiserRequest.Recordings))
	for _, recording := range optimiserRequest.Recordings {
		recordingsMap[recording] = struct{}{}
	}

	freeDaysMap := make(map[string]struct{}, len(optimiserRequest.FreeDays))
	for _, freeDay := range optimiserRequest.FreeDays {
		freeDaysMap[freeDay] = struct{}{}
	}

	moduleSlots := make(models.ModuleTimetableMap)

	// These are default or backup slots for the partial timetable so that we can display some random slot for unallocated lessons
	defaultSlots := make(models.ModuleDefaultSlotsMap)
	for _, module := range optimiserRequest.Modules {

		body, err := client.GetModuleData(optimiserRequest.AcadYear, strings.ToUpper(module))
		if err != nil {
			return nil, nil, nil, err
		}

		var moduleData struct {
			SemesterData []struct {
				Semester  int                 `json:"semester"`
				Timetable []models.ModuleSlot `json:"timetable"`
			} `json:"semesterData"`
		}
		err = json.Unmarshal(body, &moduleData)
		if err != nil {
			return nil, nil, nil, err
		}

		// Get the module timetable for the semester
		var moduleTimetable []models.ModuleSlot
		for _, semester := range moduleData.SemesterData {
			if semester.Semester == optimiserRequest.AcadSem {
				moduleTimetable = semester.Timetable
				break
			}
		}

		// Parse the weeks
		for i := range moduleTimetable {

			// Note: if weeks is not a []int, then skip parsing
			// Currently we are not handling week conflict for non-[]int weeks
			if _, ok := moduleTimetable[i].Weeks.([]any); !ok {
				continue
			}

			moduleTimetable[i].WeeksSet = make(map[int]struct{})
			weeks := moduleTimetable[i].Weeks.([]any)
			weeksStrings := make([]string, 0, len(weeks))

			for _, week := range weeks {
				weekFloat, ok := week.(float64)
				if !ok {
					continue
				}
				weekInt := int(weekFloat)
				moduleTimetable[i].WeeksSet[weekInt] = struct{}{}
				weeksStrings = append(weeksStrings, strconv.Itoa(weekInt))
			}
			moduleTimetable[i].WeeksString = strings.Join(weeksStrings, ",")
		}

		if err := validatePinnedSlots(
			moduleTimetable,
			module,
			optimiserRequest.PinnedMap,
			recordingsMap,
			freeDaysMap,
			optimiserRequest.EarliestMin,
			optimiserRequest.LatestMin,
		); err != nil {
			return nil, nil, nil, err
		}

		// Store the module slots for the module
		moduleSlots[module], defaultSlots[module] = mergeAndFilterModuleSlots(
			moduleTimetable,
			venues,
			module,
			recordingsMap,
			freeDaysMap,
			optimiserRequest.PinnedMap,
			optimiserRequest.EarliestMin,
			optimiserRequest.LatestMin,
		)

	}

	return moduleSlots, defaultSlots, recordingsMap, nil
}

// validatePinnedSlots ensures every pinned slot for this module references an existing
// lessonType and classNo in the module's raw timetable, and that a physical (non-recorded)
// pinned class does not fall on a free day or outside the requested time range. This must
// be checked against the raw timetable (not the merged output) because merging drops
// duplicate-schedule classes by design, and a pin on an existing class must never be
// rejected as missing.
func validatePinnedSlots(
	moduleTimetable []models.ModuleSlot,
	module string,
	pinnedMap map[string]models.ClassNo,
	recordingsMap map[string]struct{},
	freeDaysMap map[string]struct{},
	earliestMin int,
	latestMin int,
) error {
	lessonTypeClasses := make(map[models.LessonType]map[models.ClassNo][]models.ModuleSlot)
	for i := range moduleTimetable {
		slot := &moduleTimetable[i]
		if lessonTypeClasses[slot.LessonType] == nil {
			lessonTypeClasses[slot.LessonType] = make(map[models.ClassNo][]models.ModuleSlot)
		}
		lessonTypeClasses[slot.LessonType][slot.ClassNo] = append(
			lessonTypeClasses[slot.LessonType][slot.ClassNo],
			*slot,
		)
	}

	modulePrefix := strings.ToUpper(module) + "|"
	for lessonKey, classNo := range pinnedMap {
		if !strings.HasPrefix(lessonKey, modulePrefix) {
			continue
		}
		lessonType := strings.TrimPrefix(lessonKey, modulePrefix)
		classNos, ok := lessonTypeClasses[lessonType]
		if !ok {
			return &models.SolveError{
				Code:    http.StatusBadRequest,
				Message: fmt.Sprintf("pinned lesson type %s not found for %s", lessonType, strings.ToUpper(module)),
			}
		}
		slots, ok := classNos[classNo]
		if !ok {
			return &models.SolveError{
				Code: http.StatusBadRequest,
				Message: fmt.Sprintf(
					"pinned class %s not found for %s %s",
					classNo,
					strings.ToUpper(module),
					lessonType,
				),
			}
		}

		// Recorded lessons need no physical attendance, so their pins never conflict
		// with free days or the time range.
		if _, isRecorded := recordingsMap[lessonKey]; isRecorded {
			continue
		}
		for i := range slots {
			slot := &slots[i]
			if _, ok := freeDaysMap[slot.Day]; ok {
				return &models.SolveError{
					Code: http.StatusBadRequest,
					Message: fmt.Sprintf(
						"pinned class %s for %s %s falls on free day %s",
						classNo,
						strings.ToUpper(module),
						lessonType,
						slot.Day,
					),
				}
			}
			if isSlotOutsideTimeRange(*slot, earliestMin, latestMin) {
				return &models.SolveError{
					Code: http.StatusBadRequest,
					Message: fmt.Sprintf(
						"pinned class %s for %s %s is outside the allowed time range",
						classNo,
						strings.ToUpper(module),
						lessonType,
					),
				}
			}
		}
	}
	return nil
}

// Gets all venue information from venues.json
func getVenues() (map[string]models.Location, error) {
	venues := make(map[string]models.Location)
	err := json.Unmarshal(constants.VenuesJson, &venues)
	if err != nil {
		return nil, fmt.Errorf("Unable to load venues.json: %v", err)
	}

	return venues, nil
}

func mergeAndFilterModuleSlots(
	timetable []models.ModuleSlot,
	venues map[string]models.Location,
	module string,
	recordingsMap map[string]struct{},
	freeDaysMap map[string]struct{},
	pinnedMap map[string]models.ClassNo,
	earliestMin int,
	latestMin int,
) (map[models.LessonType]map[models.ClassNo][]models.ModuleSlot, map[models.LessonType][]models.ModuleSlot) {

	// We group by classNo because some slots come as a pair, ie you have to attend both slots to complete the lesson
	// Key: "lessonType|classNo", Value: []ModuleSlot

	defaultSlots := make(map[models.LessonType][]models.ModuleSlot) // Lesson Type -> []Module Slot
	classGroups := make(map[string][]models.ModuleSlot)
	for i := range timetable {
		slot := &timetable[i]

		// Add coordinates to slot if venue in venues.json or else use invalid coordinates
		if venue, ok := venues[slot.Venue]; ok && !isMissingVenueCoordinates(venue.Location) {
			slot.Coordinates = venue.Location
		} else {
			slot.Coordinates = constants.InvalidCoordinates
		}

		groupKey := slot.LessonType + "|" + slot.ClassNo
		classGroups[groupKey] = append(classGroups[groupKey], *slot)
	}

	// Now validate each classNo group, ie all the lessons for that slot must pass the conditions. For example,
	// MA1521 has 2 Lectures per week, so it must pass the conditions for both lectures.
	validClassGroups := make(map[string][]models.ModuleSlot)

	for groupKey, slots := range classGroups {
		parts := strings.SplitN(groupKey, "|", 2)
		lessonType := parts[0]
		classNo := parts[1]
		lessonKey := strings.ToUpper(module) + "|" + lessonType
		_, isRecorded := recordingsMap[lessonKey]

		// The user fixed this lesson to a specific class; drop all other classes so the
		// solver is forced to pick the pinned one. This must happen here, before the
		// duplicate-schedule merge below, so the pinned class can never be merged away.
		pinnedClassNo, isPinned := pinnedMap[lessonKey]
		if isPinned && classNo != pinnedClassNo {
			continue
		}

		allValid := true
		// The pinned class also becomes the default/backup slot, so that the default
		// shareable link respects the pin (map iteration order is random otherwise)
		if defaultSlots[lessonType] == nil || isPinned {
			defaultSlots[lessonType] = slots
		}

		// Only apply filters to physical lessons. Pinned classes pass these filters by
		// construction: validatePinnedSlots rejects the request if a physical pin
		// conflicts with a free day or the time range.
		if !isRecorded {
			for i := range slots {
				slot := &slots[i]
				// Check free days
				if _, ok := freeDaysMap[slot.Day]; ok {
					allValid = false
					break
				}

				if isSlotOutsideTimeRange(*slot, earliestMin, latestMin) {
					allValid = false
					break
				}
			}
		}

		// If all slots in this class are valid, keep the entire class
		if allValid {
			validClassGroups[groupKey] = slots
		}
	}

	// Now merge all slots of the same lessonType, slot, startTime, weeks and building
	// We are doing this to avoid unnecessary calculations & reduce search space

	mergedTimetable := make(
		map[models.LessonType]map[models.ClassNo][]models.ModuleSlot,
	) // Lesson Type -> Class No -> []ModuleSlot
	seenCombinations := make(map[string]bool)

	// iterate over lessonType|classNo
	for groupKey, slots := range validClassGroups {
		parts := strings.SplitN(groupKey, "|", 2)
		lessonType := parts[0]
		classNo := parts[1]
		lessonKey := strings.ToUpper(module) + "|" + lessonType

		// Parse fields for each slot before sorting
		for i := range slots {
			if err := slots[i].ParseModuleSlotFields(lessonKey); err != nil {
				// Skip invalid slots by marking with -1
				slots[i].DayIndex = -1
			}
		}

		// Sort slots by Day and StartTime to ensure consistent combinationKey
		sort.Slice(slots, func(i, j int) bool {
			if slots[i].DayIndex != slots[j].DayIndex {
				return slots[i].DayIndex < slots[j].DayIndex
			}
			return slots[i].StartMin < slots[j].StartMin
		})

		// Build a combinationKey for the entire set of slots
		var combinationParts []string
		allEVenues := true
		for _, slot := range slots {
			if _, ok := constants.EVenues[slot.Venue]; !ok {
				allEVenues = false
				buildingName := extractBuildingName(slot.Venue)
				part := slot.Day + "|" + slot.StartTime + "|" + buildingName + "|" + slot.WeeksString
				combinationParts = append(combinationParts, part)
			}
		}

		// If not all venues are E-Venues, check for duplicates
		if !allEVenues {
			combinationKey := lessonType + "|" + strings.Join(combinationParts, "|")
			if seenCombinations[combinationKey] {
				continue
			}
			seenCombinations[combinationKey] = true
		}

		if mergedTimetable[lessonType] == nil {
			mergedTimetable[lessonType] = make(map[models.ClassNo][]models.ModuleSlot)
		}
		mergedTimetable[lessonType][classNo] = slots
	}

	return mergedTimetable, defaultSlots
}

// isSlotOutsideTimeRange checks if the slot's timing falls outside the specified earliest and latest times.
func isSlotOutsideTimeRange(slot models.ModuleSlot, earliestMin, latestMin int) bool {
	startMin, startErr := models.ParseTimeToMinutes(slot.StartTime)
	endMin, endErr := models.ParseTimeToMinutes(slot.EndTime)
	if startErr != nil || endErr != nil {
		return false // If we can't parse the time, don't filter it out
	}
	return startMin < earliestMin || endMin > latestMin
}

// extractBuildingName extracts the building name from the venue name.
// Returns the part before '-' or the whole key if '-' is absent.
func extractBuildingName(key string) string {
	parts := strings.SplitN(key, "-", 2)
	return parts[0]
}

// Checks if a venue inside venues.json has missing location
func isMissingVenueCoordinates(coord models.Coordinates) bool {
	return coord.X == 0 || coord.Y == 0
}
