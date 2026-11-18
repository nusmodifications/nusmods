package modules

import (
	"testing"

	models "github.com/nusmodifications/nusmods/website/api/optimiser/_models"
)

func TestSundaySlotsAreAvailableUnlessSundayIsFree(t *testing.T) {
	timetable := []models.ModuleSlot{{
		ClassNo:    "01",
		Day:        "Sunday",
		EndTime:    "1000",
		LessonType: "Lecture",
		StartTime:  "0900",
		Venue:      "LT1",
	}}
	venues := map[string]models.Location{}
	noRecordings := map[string]struct{}{}
	noPins := map[string]models.ClassNo{}

	available, _ := mergeAndFilterModuleSlots(
		timetable,
		venues,
		"SUNDAY1010",
		noRecordings,
		map[string]struct{}{},
		noPins,
		8*60,
		18*60,
	)
	sundaySlots := available["Lecture"]["01"]
	if len(sundaySlots) != 1 {
		t.Fatalf("Sunday class count = %d, want 1", len(sundaySlots))
	}
	if sundaySlots[0].DayIndex != 6 {
		t.Errorf("Sunday DayIndex = %d, want 6", sundaySlots[0].DayIndex)
	}

	filtered, _ := mergeAndFilterModuleSlots(
		timetable,
		venues,
		"SUNDAY1010",
		noRecordings,
		map[string]struct{}{"Sunday": {}},
		noPins,
		8*60,
		18*60,
	)
	if len(filtered["Lecture"]["01"]) != 0 {
		t.Error("Sunday class remained available when Sunday was selected as a free day")
	}
}
