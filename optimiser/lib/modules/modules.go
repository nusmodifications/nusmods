package modules

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

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

func GetAllModuleSlots(optimiserRequest models.OptimiserRequest) (map[string]map[string][]ModuleSlot, error) {
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

	moduleSlots := make(map[string]map[string][]ModuleSlot)
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
			SemesterData []struct{
				Semester int `json:"semester"`
				Timetable []ModuleSlot `json:"timetable"`
			} `json:"semesterData"`
		}
		err = json.Unmarshal(body, &moduleData)
		if err != nil {
			return nil, err
		}

		// Store the module slots for the module in map
		moduleSlots[module] = mergeModuleSlots(moduleData.SemesterData[optimiserRequest.AcadSem-1].Timetable, venues)

	}

	return moduleSlots, nil
}

func mergeModuleSlots(timetable []ModuleSlot, venues map[string]Location) map[string][]ModuleSlot {
	// Lesson Type -> Day -> Start Time -> ModuleSlot	
	mergedTimetable := make(map[string]map[string]map[string][]ModuleSlot)

	for _, slot := range timetable {
		/*
			Some venues do not have location data, so we skip them
			However, E-Learn_C is a special case, as it is a virtual venue
		*/
		
		if _, ok := mergedTimetable[slot.LessonType]; !ok {
			mergedTimetable[slot.LessonType] = make(map[string]map[string][]ModuleSlot)
		}
		if _, ok := mergedTimetable[slot.LessonType][slot.Day]; !ok {
			mergedTimetable[slot.LessonType][slot.Day] = make(map[string][]ModuleSlot)
		}
		
		if slot.Venue != "E-Learn_C" {

			if venues[slot.Venue].Location.X == 0 && venues[slot.Venue].Location.Y == 0 {
				continue
			}
	
			
			// Avoid adding slots that have the same venue
			avoid := false
			for _, existingSlot := range mergedTimetable[slot.LessonType][slot.Day][slot.StartTime] {
				if extractBuildingName(existingSlot.Venue) == extractBuildingName(slot.Venue) {
					avoid = true
					break
				}
			}
			if avoid {
				continue
			}
		}


		// Add coordinates to the slot
		slot.Coordinates = venues[slot.Venue].Location
		mergedTimetable[slot.LessonType][slot.Day][slot.StartTime] = append(mergedTimetable[slot.LessonType][slot.Day][slot.StartTime], slot)
	}

	newTimetable := make(map[string][]ModuleSlot)
	for lessonType, day := range mergedTimetable {
		for _, startTime := range day {
			for _, slots := range startTime {
				newTimetable[lessonType] = append(newTimetable[lessonType], slots...)
			}
		}
	}

	return newTimetable
}

func extractBuildingName(key string) string {
	parts := strings.SplitN(key, "-", 2)
	return parts[0] // Return the part before '-' or the whole key if '-' is absent
}
