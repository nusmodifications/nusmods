package models

import (
	"testing"
)

func TestParseTimeToMinutes(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		want    int
		wantErr bool
	}{
		{"midnight", "0000", 0, false},
		{"9am", "0900", 540, false},
		{"noon", "1200", 720, false},
		{"end of day", "2359", 1439, false},
		{"earliest valid hour", "0000", 0, false},
		{"latest valid hour", "2300", 1380, false},
		{"hour too large", "2400", 0, true},
		{"hour way too large", "9900", 0, true},
		{"minute too large", "0060", 0, true},
		{"minute boundary valid", "0059", 59, false},
		{"too short", "090", 0, true},
		{"too long", "09000", 0, true},
		{"non-numeric hours", "abcd", 0, true},
		{"non-numeric minutes", "09ab", 0, true},
		{"empty string", "", 0, true},
		{"single space", " ", 0, true},
		{"mixed valid", "1530", 15*60 + 30, false},
		{"hour 23 minute 59", "2359", 23*60 + 59, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := ParseTimeToMinutes(tt.input)
			if (err != nil) != tt.wantErr {
				t.Errorf("ParseTimeToMinutes(%q) error = %v, wantErr %v", tt.input, err, tt.wantErr)
				return
			}
			if !tt.wantErr && got != tt.want {
				t.Errorf("ParseTimeToMinutes(%q) = %d, want %d", tt.input, got, tt.want)
			}
		})
	}
}

func TestParseModuleSlotFields_ValidSlots(t *testing.T) {
	t.Run("monday slot", func(t *testing.T) {
		slot := ModuleSlot{Day: "Monday", StartTime: "0900", EndTime: "1000"}
		err := slot.ParseModuleSlotFields("CS1010S|Lecture")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if slot.StartMin != 540 {
			t.Errorf("StartMin = %d, want 540", slot.StartMin)
		}
		if slot.EndMin != 600 {
			t.Errorf("EndMin = %d, want 600", slot.EndMin)
		}
		if slot.DayIndex != 0 {
			t.Errorf("DayIndex = %d, want 0", slot.DayIndex)
		}
		if slot.LessonKey != "CS1010S|Lecture" {
			t.Errorf("LessonKey = %q, want CS1010S|Lecture", slot.LessonKey)
		}
	})

	t.Run("midnight boundary", func(t *testing.T) {
		slot := ModuleSlot{Day: "Friday", StartTime: "0000", EndTime: "0100"}
		if err := slot.ParseModuleSlotFields("X|Y"); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if slot.StartMin != 0 || slot.EndMin != 60 {
			t.Errorf("StartMin=%d EndMin=%d, want 0 60", slot.StartMin, slot.EndMin)
		}
	})

	dayTests := []struct {
		day     string
		wantIdx int
	}{
		{"Monday", 0},
		{"Tuesday", 1},
		{"Wednesday", 2},
		{"Thursday", 3},
		{"Friday", 4},
		{"Saturday", 5},
		// uppercase variants
		{"MONDAY", 0},
		{"SATURDAY", 5},
		// mixed case
		{"monday", 0},
		{"friday", 4},
	}
	for _, tt := range dayTests {
		t.Run("day_"+tt.day, func(t *testing.T) {
			slot := ModuleSlot{Day: tt.day, StartTime: "0900", EndTime: "1000"}
			if err := slot.ParseModuleSlotFields("X|Y"); err != nil {
				t.Fatalf("day %q: unexpected error: %v", tt.day, err)
			}
			if slot.DayIndex != tt.wantIdx {
				t.Errorf("day %q: DayIndex = %d, want %d", tt.day, slot.DayIndex, tt.wantIdx)
			}
		})
	}
}

func TestParseModuleSlotFields_InvalidInputs(t *testing.T) {
	tests := []struct {
		name      string
		day       string
		startTime string
		endTime   string
	}{
		{"invalid StartTime letters", "Monday", "abcd", "1000"},
		{"invalid StartTime hour", "Monday", "2500", "1000"},
		{"invalid StartTime length", "Monday", "900", "1000"},
		{"invalid EndTime letters", "Monday", "0900", "wxyz"},
		{"invalid EndTime minute", "Monday", "0900", "0061"},
		{"invalid EndTime length", "Monday", "0900", "10000"},
		{"unknown day Sunday", "Sunday", "0900", "1000"},
		{"empty day", "", "0900", "1000"},
		{"numeric day", "1", "0900", "1000"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			slot := ModuleSlot{Day: tt.day, StartTime: tt.startTime, EndTime: tt.endTime}
			if err := slot.ParseModuleSlotFields("X|Y"); err == nil {
				t.Errorf("expected error for day=%q start=%q end=%q", tt.day, tt.startTime, tt.endTime)
			}
		})
	}
}

func TestParseOptimiserRequestFields(t *testing.T) {
	makeValidReq := func() OptimiserRequest {
		return OptimiserRequest{
			Modules:      []string{"CS1010S"},
			EarliestTime: "0800",
			LatestTime:   "2000",
			LunchStart:   "1200",
			LunchEnd:     "1400",
		}
	}

	t.Run("valid request parses correctly", func(t *testing.T) {
		req := makeValidReq()
		if err := req.ParseOptimiserRequestFields(); err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if req.EarliestMin != 480 {
			t.Errorf("EarliestMin = %d, want 480 (08:00)", req.EarliestMin)
		}
		if req.LatestMin != 1200 {
			t.Errorf("LatestMin = %d, want 1200 (20:00)", req.LatestMin)
		}
		if req.LunchStartMin != 720 {
			t.Errorf("LunchStartMin = %d, want 720 (12:00)", req.LunchStartMin)
		}
		if req.LunchEndMin != 840 {
			t.Errorf("LunchEndMin = %d, want 840 (14:00)", req.LunchEndMin)
		}
	})

	t.Run("multiple modules accepted", func(t *testing.T) {
		req := makeValidReq()
		req.Modules = []string{"CS1010S", "CS2040S", "MA1521"}
		if err := req.ParseOptimiserRequestFields(); err != nil {
			t.Fatalf("unexpected error with multiple modules: %v", err)
		}
	})

	t.Run("empty modules returns error", func(t *testing.T) {
		req := makeValidReq()
		req.Modules = nil
		if err := req.ParseOptimiserRequestFields(); err == nil {
			t.Error("expected error for nil modules")
		}
	})

	t.Run("empty modules slice returns error", func(t *testing.T) {
		req := makeValidReq()
		req.Modules = []string{}
		if err := req.ParseOptimiserRequestFields(); err == nil {
			t.Error("expected error for empty modules slice")
		}
	})

	t.Run("invalid EarliestTime returns error", func(t *testing.T) {
		req := makeValidReq()
		req.EarliestTime = "ABCD"
		if err := req.ParseOptimiserRequestFields(); err == nil {
			t.Error("expected error for non-numeric EarliestTime")
		}
	})

	t.Run("out-of-range EarliestTime returns error", func(t *testing.T) {
		req := makeValidReq()
		req.EarliestTime = "2500"
		if err := req.ParseOptimiserRequestFields(); err == nil {
			t.Error("expected error for hour=25 EarliestTime")
		}
	})

	t.Run("invalid LatestTime returns error", func(t *testing.T) {
		req := makeValidReq()
		req.LatestTime = "99"
		if err := req.ParseOptimiserRequestFields(); err == nil {
			t.Error("expected error for short LatestTime")
		}
	})

	t.Run("invalid LunchStart returns error", func(t *testing.T) {
		req := makeValidReq()
		req.LunchStart = ""
		if err := req.ParseOptimiserRequestFields(); err == nil {
			t.Error("expected error for empty LunchStart")
		}
	})

	t.Run("invalid LunchEnd returns error", func(t *testing.T) {
		req := makeValidReq()
		req.LunchEnd = "abc"
		if err := req.ParseOptimiserRequestFields(); err == nil {
			t.Error("expected error for non-numeric LunchEnd")
		}
	})

	t.Run("midnight EarliestTime is valid", func(t *testing.T) {
		req := makeValidReq()
		req.EarliestTime = "0000"
		if err := req.ParseOptimiserRequestFields(); err != nil {
			t.Errorf("unexpected error for midnight EarliestTime: %v", err)
		}
		if req.EarliestMin != 0 {
			t.Errorf("EarliestMin = %d, want 0", req.EarliestMin)
		}
	})
}
