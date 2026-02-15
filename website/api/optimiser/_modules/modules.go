package modules

import (
	"encoding/json"
	"sort"
	"strconv"
	"strings"

	client "github.com/nusmodifications/nusmods/website/api/optimiser/_client"
	constants "github.com/nusmodifications/nusmods/website/api/optimiser/_constants"
	models "github.com/nusmodifications/nusmods/website/api/optimiser/_models"
)

/*
- Get all module slots that pass conditions in optimiserRequest for all modules.
- Reduces search space by merging slots of the same lesson type happening at the same day and time and building.
*/
func GetAllModuleSlots(optimiserRequest models.OptimiserRequest) (map[string]map[string]map[string][]models.ModuleSlot, error) {
	venues, err := client.GetVenues()
	if err != nil {
		return nil, err
	}

	moduleSlots := make(map[string]map[string]map[string][]models.ModuleSlot)
	for _, module := range optimiserRequest.Modules {

		body, err := client.GetModuleData(optimiserRequest.AcadYear, strings.ToUpper(module))
		if err != nil {
			return nil, err
		}

		var moduleData struct {
			SemesterData []struct {
				Semester  int                 `json:"semester"`
				Timetable []models.ModuleSlot `json:"timetable"`
			} `json:"semesterData"`
		}
		err = json.Unmarshal(body, &moduleData)
		if err != nil {
			return nil, err
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

			moduleTimetable[i].WeeksSet = make(map[int]bool)
			weeks := moduleTimetable[i].Weeks.([]any)
			weeksStrings := make([]string, len(weeks))

			for j, week := range weeks {
				weekInt := int(week.(float64))
				moduleTimetable[i].WeeksSet[weekInt] = true
				weeksStrings[j] = strconv.Itoa(weekInt)
			}
			moduleTimetable[i].WeeksString = strings.Join(weeksStrings, ",")
		}

		// Store the module slots for the module
		moduleSlots[module] = mergeAndFilterModuleSlots(moduleTimetable, venues, optimiserRequest, module)

	}

	return moduleSlots, nil
}

func mergeAndFilterModuleSlots(timetable []models.ModuleSlot, venues map[string]models.Location, optimiserRequest models.OptimiserRequest, module string) map[string]map[string][]models.ModuleSlot {

	recordingsMap := make(map[string]bool, len(optimiserRequest.Recordings))
	for _, recording := range optimiserRequest.Recordings {
		recordingsMap[recording] = true
	}

	freeDaysMap := make(map[string]bool, len(optimiserRequest.FreeDays))
	for _, freeDay := range optimiserRequest.FreeDays {
		freeDaysMap[freeDay] = true
	}

	earliestMin, _ := models.ParseTimeToMinutes(optimiserRequest.EarliestTime)
	latestMin, _ := models.ParseTimeToMinutes(optimiserRequest.LatestTime)

	/*
		We group by classNo because some slots come as a pair, ie you have to attend both slots to complete the lesson

		 Key: "lessonType|classNo", Value: []ModuleSlot
	*/

	classGroups := make(map[string][]models.ModuleSlot)
	for i := range timetable {
		slot := &timetable[i]
		// Skip venues without location data, except E-Venues (virtual venue)
		if !constants.E_Venues[slot.Venue] {
			venueLocation := venues[slot.Venue].Location
			if venueLocation.X == 0 && venueLocation.Y == 0 {
				continue
			}
		}

		// Add coordinates to slot
		slot.Coordinates = venues[slot.Venue].Location

		groupKey := slot.LessonType + "|" + slot.ClassNo
		classGroups[groupKey] = append(classGroups[groupKey], *slot)
	}

	/*
		Now validate each classNo group, ie all the lessons for that slot must pass the conditions. For example,
		MA1521 has 2 Lectures per week, so it must pass the conditions for both lectures.
	*/
	validClassGroups := make(map[string][]models.ModuleSlot)

	for groupKey, slots := range classGroups {
		lessonType := strings.Split(groupKey, "|")[0]
		lessonKey := module + " " + lessonType
		isRecorded := recordingsMap[lessonKey]
		allValid := true

		// Only apply filters to physical lessons
		if !isRecorded {
			for i := range slots {
				slot := &slots[i]
				// Check free days
				if freeDaysMap[slot.Day] {
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

	/*
		Now merge all slots of the same lessonType, slot, startTime, weeks and building
		We are doing this to avoid unnecessary calculations & reduce search space
	*/

	mergedTimetable := make(map[string]map[string][]models.ModuleSlot) // Lesson Type -> Class No -> []ModuleSlot
	seenCombinations := make(map[string]bool)

	// iterate over lessonType|classNo
	for groupKey, slots := range validClassGroups {
		lessonType := strings.Split(groupKey, "|")[0]
		classNo := strings.Split(groupKey, "|")[1]
		lessonKey := module + "|" + lessonType

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
			if !constants.E_Venues[slot.Venue] {
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
			mergedTimetable[lessonType] = make(map[string][]models.ModuleSlot)
		}
		mergedTimetable[lessonType][classNo] = slots
	}

	return mergedTimetable
}

// Helper functions

/*
Extract the building name from the venue name.
Returns the part before '-' or the whole key if '-' is absent
*/
func extractBuildingName(key string) string {
	parts := strings.SplitN(key, "-", 2)
	return parts[0]
}

/*
Check if the slot's timing falls outside the specified earliest and latest times
*/
func isSlotOutsideTimeRange(slot models.ModuleSlot, earliestMin, latestMin int) bool {
	startMin, startErr := models.ParseTimeToMinutes(slot.StartTime)
	endMin, endErr := models.ParseTimeToMinutes(slot.EndTime)
	if startErr != nil || endErr != nil {
		return false // If we can't parse the time, don't filter it out
	}
	return startMin < earliestMin || endMin > latestMin
}
