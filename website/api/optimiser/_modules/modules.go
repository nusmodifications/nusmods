package modules

import (
	"encoding/json"
	"log"
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
	if err := optimiserRequest.ParseOptimiserRequestFields(); err != nil {
		return nil, nil, nil, err
	}

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
				for lessonIndex := range semester.Timetable {
					semester.Timetable[lessonIndex].LessonIndex = lessonIndex
				}
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
			weeksStrings := make([]string, len(weeks))

			for j, week := range weeks {
				weekInt := int(week.(float64))
				moduleTimetable[i].WeeksSet[weekInt] = struct{}{}
				weeksStrings[j] = strconv.Itoa(weekInt)
			}
			moduleTimetable[i].WeeksString = strings.Join(weeksStrings, ",")
		}

		// Store the module slots for the module
		moduleSlots[module], defaultSlots[module] = mergeAndFilterModuleSlots(
			moduleTimetable,
			venues,
			module,
			recordingsMap,
			freeDaysMap,
			optimiserRequest.EarliestMin,
			optimiserRequest.LatestMin,
		)

	}

	return moduleSlots, defaultSlots, recordingsMap, nil
}

// Gets all venue information from venues.json
func getVenues() (map[string]models.Location, error) {
	venues := make(map[string]models.Location)
	err := json.Unmarshal(constants.VenuesJson, &venues)
	if err != nil {
		log.Printf("unable to load venues.json: %v", err)
		return nil, err
	}

	return venues, nil
}

func mergeAndFilterModuleSlots(
	timetable []models.ModuleSlot,
	venues map[string]models.Location,
	module string,
	recordingsMap map[string]struct{},
	freeDaysMap map[string]struct{},
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
		if venue, ok := venues[slot.Venue]; ok {
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
		lessonType := strings.Split(groupKey, "|")[0]
		lessonKey := strings.ToUpper(module) + "|" + lessonType
		_, isRecorded := recordingsMap[lessonKey]
		allValid := true
		if defaultSlots[lessonType] == nil {
			defaultSlots[lessonType] = slots
		}

		// Only apply filters to physical lessons
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
		lessonType := strings.Split(groupKey, "|")[0]
		classNo := strings.Split(groupKey, "|")[1]
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
