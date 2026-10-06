package solver

import (
	"encoding/json"
	"testing"

	models "github.com/nusmodifications/nusmods/website/api/optimiser/_models"
)

func TestBeamSearchAssignsSundayAtIndexSixAndReturnsSevenDays(t *testing.T) {
	const lessonKey = "SUNDAY1010|Lecture"
	sundaySlot := models.ModuleSlot{
		ClassNo:    "01",
		Day:        "Sunday",
		DayIndex:   6,
		StartMin:   9 * 60,
		EndMin:     10 * 60,
		StartTime:  "0900",
		EndTime:    "1000",
		LessonType: "Lecture",
		LessonKey:  lessonKey,
	}

	state := beamSearch(
		[]string{lessonKey},
		map[string][][]models.ModuleSlot{lessonKey: {{sundaySlot}}},
		1,
		1,
		map[string]struct{}{},
		models.OptimiserRequest{},
	)

	if state.Assignments[lessonKey] != "01" {
		t.Fatalf("Sunday assignment = %q, want %q", state.Assignments[lessonKey], "01")
	}
	if len(state.DaySlots[6]) != 1 || state.DaySlots[6][0].Day != "Sunday" {
		t.Fatalf("Sunday slots = %#v, want the selected Sunday class at index 6", state.DaySlots[6])
	}
	for dayIndex := 0; dayIndex < 6; dayIndex++ {
		if len(state.DaySlots[dayIndex]) != 0 {
			t.Errorf("DaySlots[%d] unexpectedly contains a class", dayIndex)
		}
	}

	encoded, err := json.Marshal(state)
	if err != nil {
		t.Fatalf("json.Marshal() error = %v", err)
	}
	var response struct {
		DaySlots    [][]json.RawMessage `json:"DaySlots"`
		DayDistance []float64           `json:"DayDistance"`
	}
	if err := json.Unmarshal(encoded, &response); err != nil {
		t.Fatalf("json.Unmarshal() error = %v", err)
	}
	if len(response.DaySlots) != 7 {
		t.Errorf("serialized DaySlots length = %d, want 7", len(response.DaySlots))
	}
	if len(response.DayDistance) != 7 {
		t.Errorf("serialized DayDistance length = %d, want 7", len(response.DayDistance))
	}
}
