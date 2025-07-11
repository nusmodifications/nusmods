package modules

import (
	"encoding/json"
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
				moduleTimetable = semester.Timetable
				break
			}
		}

		// Parse the weeks
		for i := range moduleTimetable {

			// Note: if weeks is not a []int, then skip parsing
			// Currently we are not handling week conflict for non-[]int weeks
			if _, ok := moduleTimetable[i].Weeks.([]any); !ok {
				// fmt.Println("weeks is not a []int", moduleTimetable[i].Weeks)
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
		// fmt.Println("moduleSlots", moduleSlots[module])

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

	for _, slots := range validClassGroups {
		for _, slot := range slots {

			if !constants.E_Venues[slot.Venue] {
				buildingName := extractBuildingName(slot.Venue)

				combinationKey := slot.LessonType + "|" + slot.Day + "|" + slot.StartTime + "|" + buildingName + "|" + slot.WeeksString

				if seenCombinations[combinationKey] {
					continue
				}
				seenCombinations[combinationKey] = true
			}

			if mergedTimetable[slot.LessonType] == nil {
				mergedTimetable[slot.LessonType] = make(map[string][]models.ModuleSlot)
			}

			mergedTimetable[slot.LessonType][slot.ClassNo] = append(mergedTimetable[slot.LessonType][slot.ClassNo], slot)
		}
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
