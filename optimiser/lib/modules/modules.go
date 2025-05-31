package modules

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/nusmodifications/nusmods/optimiser/lib/models"
)

type ModuleSlot struct {
	ClassNo    string `json:"classNo"`
	Day        string `json:"day"`
	EndTime    string `json:"endTime"`
	LessonType string `json:"lessonType"`
	StartTime  string `json:"startTime"`
	Venue      string `json:"venue"`
	// Weeks      []int  `json:"weeks"`
	Coordinates Coordinates `json:"coordinates"`
}
type Coordinates struct {
	X float32 `json:"x"`
	Y float32 `json:"y"`
}

type Location struct {
	Location Coordinates `json:"location"`
}

func GetAllModuleSlots(optimiserRequest models.OptimiserRequest) (map[string]map[string]map[string][]ModuleSlot, error) {
	// Get all module slots for all modules
	venues := make(map[string]Location)
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

	moduleSlots := make(map[string]map[string]map[string][]ModuleSlot)
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
				Semester  int          `json:"semester"`
				Timetable []ModuleSlot `json:"timetable"`
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

func mergeAndFilterModuleSlots(timetable []ModuleSlot, venues map[string]Location, optimiserRequest models.OptimiserRequest, module string) map[string]map[string][]ModuleSlot {

	recordingsMap := make(map[string]bool, len(optimiserRequest.Recordings))
	for _, recording := range optimiserRequest.Recordings {
		recordingsMap[recording] = true
	}

	freeDaysMap := make(map[string]bool, len(optimiserRequest.FreeDays))
	for _, freeDay := range optimiserRequest.FreeDays {
		freeDaysMap[freeDay] = true
	}

	/*
	We group by classNo because some slots come as a pair, ie you have to attend both slots to complete the lesson
	*/
	
	// Group slots by lessonType and classNo
	// Key: "lessonType|classNo", Value: []ModuleSlot
	classGroups := make(map[string][]ModuleSlot)

	for _, slot := range timetable {
		// Skip venues without location data, except E-Learn_C (virtual venue)
		if slot.Venue != "E-Learn_C" {
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

	// Validate entire classNo groups - ALL slots in a class must pass conditions
	validClassGroups := make(map[string][]ModuleSlot)

	for groupKey, slots := range classGroups {
		lessonType := strings.Split(groupKey, "|")[0]
		lessonKey := module + " " + lessonType
		isRecorded := recordingsMap[lessonKey]

		// Check if ALL slots in this class pass the conditions
		allValid := true

		// Only apply filters to physical lessons
		if !isRecorded {
			for _, slot := range slots {
				// Check free days
				if freeDaysMap[slot.Day] {
					allValid = false
					break
				}

				// Check time cutoff
				if slotTimingOutsideCutOff(slot.StartTime, slot.EndTime, optimiserRequest.EarliestTime, optimiserRequest.LatestTime) {
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

	// Now apply building duplicate logic and build final result
	// Lesson Type -> Class No -> []ModuleSlot
	mergedTimetable := make(map[string]map[string][]ModuleSlot)
	seenCombinations := make(map[string]bool)

	for _, slots := range validClassGroups {
		for _, slot := range slots {
			lessonKey := module + " " + slot.LessonType
			isRecorded := recordingsMap[lessonKey]

			// For physical lessons, avoid duplicate buildings at same time
			if !isRecorded && slot.Venue != "E-Learn_C" {
				buildingName := extractBuildingName(slot.Venue)
				combinationKey := slot.LessonType + "|" + slot.Day + "|" + slot.StartTime + "|" + buildingName

				if seenCombinations[combinationKey] {
					continue
				}
				seenCombinations[combinationKey] = true
			}

			if mergedTimetable[slot.LessonType] == nil {
				mergedTimetable[slot.LessonType] = make(map[string][]ModuleSlot)
			}

			mergedTimetable[slot.LessonType][slot.ClassNo] = append(mergedTimetable[slot.LessonType][slot.ClassNo], slot)
		}
	}

	return mergedTimetable
}





// Helper functions

func extractBuildingName(key string) string {
	parts := strings.SplitN(key, "-", 2)
	return parts[0] // Return the part before '-' or the whole key if '-' is absent
}

func slotTimingOutsideCutOff(startTime string, endTime string, earliestTime string, latestTime string) bool {
	startTimeParsed, err := time.Parse("15:04", startTime)
	if err != nil {
		return false
	}
	endTimeParsed, err := time.Parse("15:04", endTime)
	if err != nil {
		return false
	}

	earliestTimeParsed, err := time.Parse("15:04", earliestTime)
	if err != nil {
		return false
	}
	latestTimeParsed, err := time.Parse("15:04", latestTime)
	if err != nil {
		return false
	}

	if startTimeParsed.Before(earliestTimeParsed) || endTimeParsed.After(latestTimeParsed) {
		return true
	}
	return false
}
