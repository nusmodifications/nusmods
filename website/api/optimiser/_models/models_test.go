package models

import "testing"

func TestParseModuleSlotFieldsPreservesWeekdayIndexesAndAddsSunday(t *testing.T) {
	days := []string{"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"}

	for expectedIndex, day := range days {
		t.Run(day, func(t *testing.T) {
			slot := ModuleSlot{Day: day, StartTime: "0900", EndTime: "1000"}
			if err := slot.ParseModuleSlotFields("SUNDAY1010|Lecture"); err != nil {
				t.Fatalf("ParseModuleSlotFields() error = %v", err)
			}
			if slot.DayIndex != expectedIndex {
				t.Errorf("DayIndex = %d, want %d", slot.DayIndex, expectedIndex)
			}
		})
	}
}
