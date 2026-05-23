package modules

import (
	"testing"

	constants "github.com/nusmodifications/nusmods/website/api/optimiser/_constants"
	models "github.com/nusmodifications/nusmods/website/api/optimiser/_models"
)

// ──────────────────────────────────────────────────
// extractBuildingName
// ──────────────────────────────────────────────────

func TestExtractBuildingName(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"BIZ2-0111", "BIZ2"},
		{"COM1-0212", "COM1"},
		{"AS4-0602", "AS4"},
		{"LT17", "LT17"}, // no hyphen — whole string returned
		{"", ""},         // empty string
		{"A-B-C", "A"},   // only first segment
		{"-suffix", ""},  // leading hyphen gives empty first segment
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			got := extractBuildingName(tt.input)
			if got != tt.want {
				t.Errorf("extractBuildingName(%q) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}

// ──────────────────────────────────────────────────
// isMissingVenueCoordinates
// ──────────────────────────────────────────────────

func TestIsMissingVenueCoordinates(t *testing.T) {
	tests := []struct {
		name  string
		coord models.Coordinates
		want  bool
	}{
		{"both zero", models.Coordinates{X: 0, Y: 0}, true},
		{"X zero Y non-zero", models.Coordinates{X: 0, Y: 1.29}, true},
		{"X non-zero Y zero", models.Coordinates{X: 103.77, Y: 0}, true},
		{"both non-zero", models.Coordinates{X: 103.77, Y: 1.29}, false},
		{"negative coords (valid non-zero)", models.Coordinates{X: -1, Y: -1}, false},
		{"very small non-zero", models.Coordinates{X: 0.0001, Y: 0.0001}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := isMissingVenueCoordinates(tt.coord)
			if got != tt.want {
				t.Errorf("isMissingVenueCoordinates(%v) = %v, want %v", tt.coord, got, tt.want)
			}
		})
	}
}

// ──────────────────────────────────────────────────
// isSlotOutsideTimeRange
// ──────────────────────────────────────────────────

func TestIsSlotOutsideTimeRange(t *testing.T) {
	// earliestMin=480 (08:00), latestMin=1020 (17:00)
	earliest, latest := 480, 1020

	tests := []struct {
		name      string
		startTime string
		endTime   string
		want      bool
	}{
		{"within range", "0900", "1000", false},
		{"starts exactly at earliest", "0800", "0900", false},
		{"ends exactly at latest", "1600", "1700", false},
		{"starts before earliest", "0700", "0800", true},
		{"ends after latest", "1700", "1800", true},
		{"starts before and ends after latest", "0700", "1800", true},
		{"starts at latest (end is fine)", "1700", "1800", true},   // end > latest
		{"invalid StartTime returns false", "abcd", "1000", false}, // conservative
		{"invalid EndTime returns false", "0900", "wxyz", false},   // conservative
		{"empty StartTime returns false", "", "1000", false},
		{"empty EndTime returns false", "0900", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			slot := models.ModuleSlot{StartTime: tt.startTime, EndTime: tt.endTime}
			got := isSlotOutsideTimeRange(slot, earliest, latest)
			if got != tt.want {
				t.Errorf("isSlotOutsideTimeRange(start=%q, end=%q, earliest=%d, latest=%d) = %v, want %v",
					tt.startTime, tt.endTime, earliest, latest, got, tt.want)
			}
		})
	}
}

// ──────────────────────────────────────────────────
// mergeAndFilterModuleSlots
// ──────────────────────────────────────────────────

// minVenues creates a minimal venues map for testing.
func minVenues() map[string]models.Location {
	return map[string]models.Location{
		"BIZ2-0111": {Location: models.Coordinates{X: 103.7748, Y: 1.2936}},
		"COM1-0212": {Location: models.Coordinates{X: 103.7716, Y: 1.2952}},
		// E-Venue entries
		"E-Learn_A": {Location: models.Coordinates{X: 103.77, Y: 1.29}},
	}
}

// makeRawSlot builds a timetable slot as would come from the NUSMods API.
func makeRawSlot(lessonType, classNo, day, startTime, endTime, venue string) models.ModuleSlot {
	return models.ModuleSlot{
		LessonType: lessonType,
		ClassNo:    classNo,
		Day:        day,
		StartTime:  startTime,
		EndTime:    endTime,
		Venue:      venue,
	}
}

func TestMergeAndFilterModuleSlots_FreeDayFiltering(t *testing.T) {
	venues := minVenues()
	freeDays := map[string]struct{}{"Monday": {}}
	recordings := map[string]struct{}{}

	timetable := []models.ModuleSlot{
		makeRawSlot("Lecture", "01", "Monday", "0900", "1000", "BIZ2-0111"),
		makeRawSlot("Lecture", "02", "Tuesday", "1000", "1100", "BIZ2-0111"),
	}

	merged, _ := mergeAndFilterModuleSlots(timetable, venues, "CS1010S", recordings, freeDays, 0, 1440)

	lectureGroups := merged["Lecture"]
	if _, ok := lectureGroups["01"]; ok {
		t.Error("class 01 on Monday (free day) should be filtered out")
	}
	if _, ok := lectureGroups["02"]; !ok {
		t.Error("class 02 on Tuesday should be kept")
	}
}

func TestMergeAndFilterModuleSlots_TimeRangeFiltering(t *testing.T) {
	venues := minVenues()
	freeDays := map[string]struct{}{}
	recordings := map[string]struct{}{}

	// earliestMin=600 (10:00), latestMin=1020 (17:00)
	timetable := []models.ModuleSlot{
		makeRawSlot("Lecture", "01", "Tuesday", "0800", "0900", "BIZ2-0111"), // before earliest
		makeRawSlot("Lecture", "02", "Tuesday", "1000", "1100", "BIZ2-0111"), // within range
		makeRawSlot("Lecture", "03", "Tuesday", "1700", "1800", "BIZ2-0111"), // after latest
	}

	merged, _ := mergeAndFilterModuleSlots(timetable, venues, "CS1010S", recordings, freeDays, 600, 1020)

	lectureGroups := merged["Lecture"]
	if _, ok := lectureGroups["01"]; ok {
		t.Error("class 01 at 08:00 (before earliest) should be filtered out")
	}
	if _, ok := lectureGroups["02"]; !ok {
		t.Error("class 02 at 10:00 (within range) should be kept")
	}
	if _, ok := lectureGroups["03"]; ok {
		t.Error("class 03 at 17:00 (after latest) should be filtered out")
	}
}

func TestMergeAndFilterModuleSlots_RecordedLessonBypassesFilters(t *testing.T) {
	venues := minVenues()
	freeDays := map[string]struct{}{"Monday": {}}
	recordings := map[string]struct{}{"CS1010S|Lecture": {}}

	// Lecture class on a free day should be kept because it's recorded
	timetable := []models.ModuleSlot{
		makeRawSlot("Lecture", "01", "Monday", "0900", "1000", "BIZ2-0111"),
	}

	merged, _ := mergeAndFilterModuleSlots(timetable, venues, "CS1010S", recordings, freeDays, 480, 1020)

	if _, ok := merged["Lecture"]["01"]; !ok {
		t.Error("recorded lecture on free day should not be filtered out")
	}
}

func TestMergeAndFilterModuleSlots_RecordedBypassesTimeRange(t *testing.T) {
	venues := minVenues()
	freeDays := map[string]struct{}{}
	recordings := map[string]struct{}{"CS1010S|Lecture": {}}

	// Lecture outside time range but recorded → should be kept
	timetable := []models.ModuleSlot{
		makeRawSlot("Lecture", "01", "Tuesday", "0700", "0800", "BIZ2-0111"),
	}

	merged, _ := mergeAndFilterModuleSlots(timetable, venues, "CS1010S", recordings, freeDays, 480, 1020)

	if _, ok := merged["Lecture"]["01"]; !ok {
		t.Error("recorded lecture outside time range should not be filtered out")
	}
}

func TestMergeAndFilterModuleSlots_VenueCoordinatesAssigned(t *testing.T) {
	venues := minVenues()
	freeDays := map[string]struct{}{}
	recordings := map[string]struct{}{}

	timetable := []models.ModuleSlot{
		makeRawSlot("Lecture", "01", "Tuesday", "0900", "1000", "BIZ2-0111"),   // in venues
		makeRawSlot("Tutorial", "T01", "Wednesday", "1000", "1100", "UNKNOWN"), // not in venues
	}

	merged, _ := mergeAndFilterModuleSlots(timetable, venues, "CS1010S", recordings, freeDays, 0, 1440)

	lecSlots := merged["Lecture"]["01"]
	if len(lecSlots) == 0 {
		t.Fatal("expected lecture class 01 in merged")
	}
	if lecSlots[0].Coordinates != (models.Coordinates{X: 103.7748, Y: 1.2936}) {
		t.Errorf("expected BIZ2-0111 coordinates, got %v", lecSlots[0].Coordinates)
	}

	tutSlots := merged["Tutorial"]["T01"]
	if len(tutSlots) == 0 {
		t.Fatal("expected tutorial class T01 in merged")
	}
	if tutSlots[0].Coordinates != constants.InvalidCoordinates {
		t.Errorf("expected InvalidCoordinates for unknown venue, got %v", tutSlots[0].Coordinates)
	}
}

func TestMergeAndFilterModuleSlots_VenueWithZeroCoordinatesGetsInvalid(t *testing.T) {
	// A venue in the map but with X=0 or Y=0 should be treated as missing
	venues := map[string]models.Location{
		"ZEROVENUE": {Location: models.Coordinates{X: 0, Y: 0}},
	}
	freeDays := map[string]struct{}{}
	recordings := map[string]struct{}{}

	timetable := []models.ModuleSlot{
		makeRawSlot("Lecture", "01", "Tuesday", "0900", "1000", "ZEROVENUE"),
	}

	merged, _ := mergeAndFilterModuleSlots(timetable, venues, "CS1010S", recordings, freeDays, 0, 1440)

	slots := merged["Lecture"]["01"]
	if len(slots) == 0 {
		t.Fatal("expected class 01 in merged")
	}
	if slots[0].Coordinates != constants.InvalidCoordinates {
		t.Errorf("expected InvalidCoordinates for zero-coord venue, got %v", slots[0].Coordinates)
	}
}

func TestMergeAndFilterModuleSlots_DuplicateSlotsAreMerged(t *testing.T) {
	// Two classes with same day/time/building/weeks → only one should survive
	venues := minVenues()
	freeDays := map[string]struct{}{}
	recordings := map[string]struct{}{}

	timetable := []models.ModuleSlot{
		{LessonType: "Lecture", ClassNo: "01", Day: "Tuesday", StartTime: "0900", EndTime: "1000", Venue: "BIZ2-0111", WeeksString: "1,2,3"},
		{LessonType: "Lecture", ClassNo: "02", Day: "Tuesday", StartTime: "0900", EndTime: "1000", Venue: "BIZ2-0222", WeeksString: "1,2,3"},
	}

	merged, _ := mergeAndFilterModuleSlots(timetable, venues, "CS1010S", recordings, freeDays, 0, 1440)

	lectureGroups := merged["Lecture"]
	if len(lectureGroups) != 1 {
		t.Errorf("expected 1 unique Lecture class group after deduplication, got %d", len(lectureGroups))
	}
}

func TestMergeAndFilterModuleSlots_EVenuesNotDeduplicated(t *testing.T) {
	// E-Venue slots should never be deduplicated regardless of identical day/time
	venues := minVenues()
	freeDays := map[string]struct{}{}
	recordings := map[string]struct{}{}

	timetable := []models.ModuleSlot{
		{LessonType: "Lecture", ClassNo: "E1", Day: "Tuesday", StartTime: "0900", EndTime: "1000", Venue: "E-Learn_A", WeeksString: "1,2"},
		{LessonType: "Lecture", ClassNo: "E2", Day: "Tuesday", StartTime: "0900", EndTime: "1000", Venue: "E-Learn_A", WeeksString: "1,2"},
	}

	merged, _ := mergeAndFilterModuleSlots(timetable, venues, "CS1010S", recordings, freeDays, 0, 1440)

	lectureGroups := merged["Lecture"]
	if len(lectureGroups) != 2 {
		t.Errorf("expected 2 E-Venue class groups (no dedup), got %d: %v", len(lectureGroups), lectureGroups)
	}
}

func TestMergeAndFilterModuleSlots_DefaultSlotsPopulated(t *testing.T) {
	// defaultSlots should contain a slot for every lesson type encountered
	venues := minVenues()
	freeDays := map[string]struct{}{}
	recordings := map[string]struct{}{}

	timetable := []models.ModuleSlot{
		makeRawSlot("Lecture", "01", "Tuesday", "0900", "1000", "BIZ2-0111"),
		makeRawSlot("Tutorial", "T01", "Wednesday", "1000", "1100", "COM1-0212"),
	}

	_, defaultSlots := mergeAndFilterModuleSlots(timetable, venues, "CS1010S", recordings, freeDays, 0, 1440)

	if _, ok := defaultSlots["Lecture"]; !ok {
		t.Error("expected Lecture in defaultSlots")
	}
	if _, ok := defaultSlots["Tutorial"]; !ok {
		t.Error("expected Tutorial in defaultSlots")
	}
}

func TestMergeAndFilterModuleSlots_PairedSlotsFilteredTogether(t *testing.T) {
	// A class with two paired slots (e.g., two lectures per week) must have BOTH
	// pass constraints — if one fails, the whole class is excluded.
	venues := minVenues()
	freeDays := map[string]struct{}{"Wednesday": {}}
	recordings := map[string]struct{}{}

	// Class "01" has two paired slots: Tuesday (ok) + Wednesday (free day → fails)
	timetable := []models.ModuleSlot{
		makeRawSlot("Lecture", "01", "Tuesday", "0900", "1000", "BIZ2-0111"),
		makeRawSlot("Lecture", "01", "Wednesday", "0900", "1000", "BIZ2-0111"), // free day
		makeRawSlot("Lecture", "02", "Tuesday", "1100", "1200", "BIZ2-0111"),   // no issues
	}

	merged, _ := mergeAndFilterModuleSlots(timetable, venues, "CS1010S", recordings, freeDays, 0, 1440)

	if _, ok := merged["Lecture"]["01"]; ok {
		t.Error("class 01 with one slot on free day should be entirely excluded")
	}
	if _, ok := merged["Lecture"]["02"]; !ok {
		t.Error("class 02 with no issues should be kept")
	}
}

func TestMergeAndFilterModuleSlots_EmptyTimetable(t *testing.T) {
	venues := minVenues()
	freeDays := map[string]struct{}{}
	recordings := map[string]struct{}{}

	merged, defaultSlots := mergeAndFilterModuleSlots(
		nil, venues, "CS1010S", recordings, freeDays, 0, 1440,
	)

	if len(merged) != 0 {
		t.Errorf("expected empty merged for nil timetable, got %v", merged)
	}
	if len(defaultSlots) != 0 {
		t.Errorf("expected empty defaultSlots for nil timetable, got %v", defaultSlots)
	}
}
