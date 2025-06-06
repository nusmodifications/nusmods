package modules

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/nusmodifications/nusmods/optimiser/lib/models"
)

var E_Venues = map[string]bool{
	"E-Learn_A":  true,
	"E-Learn_B":  true,
	"E-Learn_C":  true,
	"E-Learn_D":  true,
	"E-Hybrid_A": true,
	"E-Hybrid_B": true,
	"E-Hybrid_C": true,
	"E-Hybrid_D": true,
}

/*
- Get all module slots that pass conditions in optimiserRequest for all modules.
- Reduces search space by merging slots of the same lesson type happening at the same day and time and building.
*/
func GetAllModuleSlots(optimiserRequest models.OptimiserRequest) (map[string]map[string]map[string][]models.ModuleSlot, error) {
	venues := make(map[string]models.Location)
	url := "https://github.nusmods.com/venues"
	res, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(body, &venues)
	if err != nil {
		return nil, err
	}

	moduleSlots := make(map[string]map[string]map[string][]models.ModuleSlot)
	for _, module := range optimiserRequest.Modules {
		url = fmt.Sprintf("https://api.nusmods.com/v2/%s/modules/%s.json", optimiserRequest.AcadYear, strings.ToUpper(module))
		res, err := http.Get(url)
		if err != nil {
			return nil, err
		}
		defer res.Body.Close()

		body, err := io.ReadAll(res.Body)
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

		// Store the module slots for the module in map
		moduleSlots[module] = mergeAndFilterModuleSlots(moduleData.SemesterData[optimiserRequest.AcadSem-1].Timetable, venues, optimiserRequest, module)

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
	for _, slot := range timetable {
		// Skip venues without location data, except E-Learn_C (virtual venue)
		if !E_Venues[slot.Venue] {
			venueLocation := venues[slot.Venue].Location
			if venueLocation.X == 0 && venueLocation.Y == 0 {
				continue
			}
		}

		// Add coordinates to slot
		slot.Coordinates = venues[slot.Venue].Location

		groupKey := slot.LessonType + "|" + slot.ClassNo
		classGroups[groupKey] = append(classGroups[groupKey], slot)
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
			for _, slot := range slots {
				// Check free days
				if freeDaysMap[slot.Day] {
					allValid = false
					break
				}

				if isSlotOutsideTimeRange(slot, earliestMin, latestMin) {
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
		Now merge all slots of the same lessonType, slot, startTime and building
		We are doing this to avoid unnecessary calculations & reduce search space
	*/

	mergedTimetable := make(map[string]map[string][]models.ModuleSlot) // Lesson Type -> Class No -> []ModuleSlot
	seenCombinations := make(map[string]bool)

	for _, slots := range validClassGroups {
		for _, slot := range slots {
			lessonKey := module + " " + slot.LessonType
			isRecorded := recordingsMap[lessonKey]

			if !isRecorded && slot.Venue != "E-Learn_C" {
				buildingName := extractBuildingName(slot.Venue)
				combinationKey := slot.LessonType + "|" + slot.Day + "|" + slot.StartTime + "|" + buildingName

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
