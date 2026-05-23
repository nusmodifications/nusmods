package solver

import (
	"math"
	"testing"

	constants "github.com/nusmodifications/nusmods/website/api/optimiser/_constants"
	models "github.com/nusmodifications/nusmods/website/api/optimiser/_models"
)

// makeSlot builds a ModuleSlot with parsed time/day fields populated via ParseModuleSlotFields.
func makeSlot(lessonKey, day, startTime, endTime string) models.ModuleSlot {
	slot := models.ModuleSlot{
		Day:         day,
		StartTime:   startTime,
		EndTime:     endTime,
		Coordinates: constants.InvalidCoordinates,
	}
	_ = slot.ParseModuleSlotFields(lessonKey)
	return slot
}

// makeSlotWithCoords creates a slot with specific venue coordinates.
func makeSlotWithCoords(lessonKey, day, startTime, endTime string, coords models.Coordinates) models.ModuleSlot {
	slot := makeSlot(lessonKey, day, startTime, endTime)
	slot.Coordinates = coords
	return slot
}

// makeSlotWithWeeks creates a slot with a specific week set.
func makeSlotWithWeeks(lessonKey, day, startTime, endTime string, weeks []int) models.ModuleSlot {
	slot := makeSlot(lessonKey, day, startTime, endTime)
	slot.WeeksSet = make(map[int]struct{}, len(weeks))
	for _, w := range weeks {
		slot.WeeksSet[w] = struct{}{}
	}
	return slot
}

// lunchReq returns an OptimiserRequest with lunch window set.
func lunchReq(lunchStart, lunchEnd, maxHours int) models.OptimiserRequest {
	return models.OptimiserRequest{
		LunchStartMin:       lunchStart,
		LunchEndMin:         lunchEnd,
		MaxConsecutiveHours: maxHours,
	}
}

// stateWithDay returns a TimetableState with the given slots on day 0 (Monday).
func stateWithDay(slots []models.ModuleSlot) models.TimetableState {
	s := models.TimetableState{
		Assignments: make(map[string]string),
	}
	for d := range s.DaySlots {
		s.DaySlots[d] = make([]models.ModuleSlot, 0)
	}
	s.DaySlots[0] = slots
	return s
}

// ──────────────────────────────────────────────────
// hasConflict
// ──────────────────────────────────────────────────

func TestHasConflict(t *testing.T) {
	t.Run("empty state has no conflict", func(t *testing.T) {
		state := stateWithDay(nil)
		newSlot := makeSlot("A|Lecture", "Monday", "0900", "1000")
		if hasConflict(state, []models.ModuleSlot{newSlot}) {
			t.Error("expected no conflict against empty state")
		}
	})

	t.Run("different days never conflict", func(t *testing.T) {
		existing := makeSlot("A|Lecture", "Monday", "0900", "1100")
		state := stateWithDay([]models.ModuleSlot{existing})
		newSlot := makeSlot("B|Lecture", "Tuesday", "0900", "1100")
		if hasConflict(state, []models.ModuleSlot{newSlot}) {
			t.Error("expected no conflict for different days")
		}
	})

	t.Run("same day non-overlapping times no conflict", func(t *testing.T) {
		existing := makeSlot("A|Lecture", "Monday", "0900", "1000")
		state := stateWithDay([]models.ModuleSlot{existing})
		// starts exactly when existing ends — adjacent, not overlapping
		newSlot := makeSlot("B|Lecture", "Monday", "1000", "1100")
		if hasConflict(state, []models.ModuleSlot{newSlot}) {
			t.Error("adjacent slots should not conflict (open interval overlap)")
		}
	})

	t.Run("same day non-overlapping with gap no conflict", func(t *testing.T) {
		existing := makeSlot("A|Lecture", "Monday", "0900", "1000")
		state := stateWithDay([]models.ModuleSlot{existing})
		newSlot := makeSlot("B|Lecture", "Monday", "1100", "1200")
		if hasConflict(state, []models.ModuleSlot{newSlot}) {
			t.Error("expected no conflict for distinct time slots")
		}
	})

	t.Run("same day overlapping times both nil WeeksSet returns conflict", func(t *testing.T) {
		existing := makeSlot("A|Lecture", "Monday", "0900", "1100")
		// WeeksSet is nil by default from makeSlot
		state := stateWithDay([]models.ModuleSlot{existing})
		newSlot := makeSlot("B|Lecture", "Monday", "1000", "1200")
		if !hasConflict(state, []models.ModuleSlot{newSlot}) {
			t.Error("expected conflict for overlapping times with nil weeks")
		}
	})

	t.Run("same day overlapping times overlapping weeks returns conflict", func(t *testing.T) {
		existing := makeSlotWithWeeks("A|Lecture", "Monday", "0900", "1100", []int{1, 2, 3})
		state := stateWithDay([]models.ModuleSlot{existing})
		newSlot := makeSlotWithWeeks("B|Lecture", "Monday", "1000", "1200", []int{3, 4, 5})
		if !hasConflict(state, []models.ModuleSlot{newSlot}) {
			t.Error("expected conflict for overlapping times and overlapping weeks")
		}
	})

	t.Run("same day overlapping times non-overlapping weeks no conflict", func(t *testing.T) {
		existing := makeSlotWithWeeks("A|Lecture", "Monday", "0900", "1100", []int{1, 2, 3})
		state := stateWithDay([]models.ModuleSlot{existing})
		newSlot := makeSlotWithWeeks("B|Lecture", "Monday", "0900", "1100", []int{4, 5, 6})
		if hasConflict(state, []models.ModuleSlot{newSlot}) {
			t.Error("expected no conflict for overlapping times but distinct weeks")
		}
	})

	t.Run("newSlot fully inside existing slot is conflict", func(t *testing.T) {
		existing := makeSlot("A|Lecture", "Monday", "0900", "1200")
		state := stateWithDay([]models.ModuleSlot{existing})
		newSlot := makeSlot("B|Lecture", "Monday", "1000", "1100")
		if !hasConflict(state, []models.ModuleSlot{newSlot}) {
			t.Error("expected conflict for nested time slots")
		}
	})

	t.Run("multiple new slots one conflicts", func(t *testing.T) {
		existing := makeSlot("A|Lecture", "Monday", "0900", "1000")
		state := stateWithDay([]models.ModuleSlot{existing})
		noConflict := makeSlot("B|Tutorial", "Tuesday", "1000", "1100")
		conflict := makeSlot("C|Lab", "Monday", "0930", "1030")
		if !hasConflict(state, []models.ModuleSlot{noConflict, conflict}) {
			t.Error("expected conflict when at least one new slot conflicts")
		}
	})

	t.Run("one week set nil the other non-nil overlapping time returns conflict", func(t *testing.T) {
		existing := makeSlot("A|Lecture", "Monday", "0900", "1100") // WeeksSet nil
		state := stateWithDay([]models.ModuleSlot{existing})
		newSlot := makeSlotWithWeeks("B|Lecture", "Monday", "1000", "1200", []int{1, 2})
		if !hasConflict(state, []models.ModuleSlot{newSlot}) {
			t.Error("expected conflict when existing has nil WeeksSet and times overlap")
		}
	})
}

// ──────────────────────────────────────────────────
// copyState
// ──────────────────────────────────────────────────

func TestCopyState(t *testing.T) {
	t.Run("copy of empty state is independent", func(t *testing.T) {
		src := models.TimetableState{
			Assignments: make(map[string]string),
		}
		for d := range src.DaySlots {
			src.DaySlots[d] = make([]models.ModuleSlot, 0)
		}
		dst := copyState(src)
		dst.Assignments["X|Y"] = "01"
		if _, ok := src.Assignments["X|Y"]; ok {
			t.Error("modifying copy's Assignments should not affect original")
		}
	})

	t.Run("modifying copy Assignments does not affect original", func(t *testing.T) {
		src := models.TimetableState{
			Assignments: map[string]string{"CS1010S|Lecture": "01"},
		}
		for d := range src.DaySlots {
			src.DaySlots[d] = make([]models.ModuleSlot, 0)
		}
		dst := copyState(src)
		dst.Assignments["CS1010S|Lecture"] = "99"
		if src.Assignments["CS1010S|Lecture"] != "01" {
			t.Error("original Assignments should not be mutated by copy modification")
		}
	})

	t.Run("modifying copy DaySlots does not affect original", func(t *testing.T) {
		slot := makeSlot("A|Lecture", "Monday", "0900", "1000")
		src := stateWithDay([]models.ModuleSlot{slot})
		initialLen := len(src.DaySlots[0])

		dst := copyState(src)
		extraSlot := makeSlot("B|Tutorial", "Monday", "1000", "1100")
		dst.DaySlots[0] = append(dst.DaySlots[0], extraSlot)

		if len(src.DaySlots[0]) != initialLen {
			t.Error("modifying copy's DaySlots should not change original length")
		}
	})

	t.Run("distance values are copied", func(t *testing.T) {
		src := models.TimetableState{
			Assignments:   make(map[string]string),
			TotalDistance: 42.5,
			DayDistance:   [6]float64{1, 2, 3, 4, 5, 6},
		}
		for d := range src.DaySlots {
			src.DaySlots[d] = make([]models.ModuleSlot, 0)
		}
		dst := copyState(src)
		if dst.TotalDistance != 42.5 {
			t.Errorf("TotalDistance = %v, want 42.5", dst.TotalDistance)
		}
		if dst.DayDistance != src.DayDistance {
			t.Errorf("DayDistance mismatch: got %v want %v", dst.DayDistance, src.DayDistance)
		}
	})

	t.Run("modifying copy distance does not affect original", func(t *testing.T) {
		src := models.TimetableState{
			Assignments:   make(map[string]string),
			TotalDistance: 10.0,
		}
		for d := range src.DaySlots {
			src.DaySlots[d] = make([]models.ModuleSlot, 0)
		}
		dst := copyState(src)
		dst.TotalDistance = 99.0
		if src.TotalDistance != 10.0 {
			t.Error("original TotalDistance should not be affected by copy modification")
		}
	})
}

// ──────────────────────────────────────────────────
// insertSlotSorted
// ──────────────────────────────────────────────────

func TestInsertSlotSorted(t *testing.T) {
	slot := func(startMin int) models.ModuleSlot {
		return models.ModuleSlot{StartMin: startMin}
	}

	assertOrder := func(t *testing.T, slots []models.ModuleSlot, wantMins []int) {
		t.Helper()
		if len(slots) != len(wantMins) {
			t.Fatalf("len(slots)=%d want %d", len(slots), len(wantMins))
		}
		for i, s := range slots {
			if s.StartMin != wantMins[i] {
				t.Errorf("slots[%d].StartMin = %d, want %d", i, s.StartMin, wantMins[i])
			}
		}
	}

	t.Run("insert into empty slice", func(t *testing.T) {
		result := insertSlotSorted([]models.ModuleSlot{}, slot(540))
		assertOrder(t, result, []int{540})
	})

	t.Run("insert smallest prepends", func(t *testing.T) {
		existing := []models.ModuleSlot{slot(600), slot(720)}
		result := insertSlotSorted(existing, slot(480))
		assertOrder(t, result, []int{480, 600, 720})
	})

	t.Run("insert largest appends", func(t *testing.T) {
		existing := []models.ModuleSlot{slot(480), slot(600)}
		result := insertSlotSorted(existing, slot(720))
		assertOrder(t, result, []int{480, 600, 720})
	})

	t.Run("insert in middle", func(t *testing.T) {
		existing := []models.ModuleSlot{slot(480), slot(720)}
		result := insertSlotSorted(existing, slot(600))
		assertOrder(t, result, []int{480, 600, 720})
	})

	t.Run("insert with equal StartMin goes after", func(t *testing.T) {
		// Binary search uses <=, so equal StartMin puts the new slot after the existing one.
		existing := []models.ModuleSlot{slot(480), slot(600)}
		result := insertSlotSorted(existing, slot(600))
		if len(result) != 3 {
			t.Fatalf("expected 3 slots, got %d", len(result))
		}
		if result[1].StartMin != 600 || result[2].StartMin != 600 {
			t.Errorf("equal-StartMin slot not in positions 1,2: %v", result)
		}
	})

	t.Run("insert into many slots stays sorted", func(t *testing.T) {
		existing := []models.ModuleSlot{slot(480), slot(540), slot(660), slot(780)}
		result := insertSlotSorted(existing, slot(600))
		assertOrder(t, result, []int{480, 540, 600, 660, 780})
	})
}

// ──────────────────────────────────────────────────
// isLessonRecorded
// ──────────────────────────────────────────────────

func TestIsLessonRecorded(t *testing.T) {
	recordings := map[string]struct{}{
		"CS1010S|Lecture":  {},
		"CS2040S|Tutorial": {},
	}

	if !isLessonRecorded("CS1010S|Lecture", recordings) {
		t.Error("expected CS1010S|Lecture to be recorded")
	}
	if !isLessonRecorded("CS2040S|Tutorial", recordings) {
		t.Error("expected CS2040S|Tutorial to be recorded")
	}
	if isLessonRecorded("CS1010S|Tutorial", recordings) {
		t.Error("CS1010S|Tutorial should not be recorded")
	}
	if isLessonRecorded("", recordings) {
		t.Error("empty key should not be recorded")
	}
	if isLessonRecorded("CS1010S|Lecture", nil) {
		t.Error("should not be recorded when recordings map is nil")
	}
	if isLessonRecorded("CS1010S|Lecture", map[string]struct{}{}) {
		t.Error("should not be recorded when recordings map is empty")
	}
}

// ──────────────────────────────────────────────────
// isInvalidCoordinates
// ──────────────────────────────────────────────────

func TestIsInvalidCoordinates(t *testing.T) {
	t.Run("sentinel InvalidCoordinates returns true", func(t *testing.T) {
		if !isInvalidCoordinates(constants.InvalidCoordinates) {
			t.Error("expected InvalidCoordinates to be invalid")
		}
	})

	t.Run("negative sentinel -1,-1 returns true", func(t *testing.T) {
		if !isInvalidCoordinates(models.Coordinates{X: -1, Y: -1}) {
			t.Error("expected {-1,-1} to be invalid")
		}
	})

	t.Run("valid coordinates return false", func(t *testing.T) {
		if isInvalidCoordinates(models.Coordinates{X: 103.7748, Y: 1.2936}) {
			t.Error("expected real coordinates to be valid")
		}
	})

	t.Run("zero coordinates are NOT the sentinel", func(t *testing.T) {
		// Sentinel is {-1,-1}, not {0,0}
		if isInvalidCoordinates(models.Coordinates{X: 0, Y: 0}) {
			t.Error("{0,0} should be valid (not the InvalidCoordinates sentinel)")
		}
	})

	t.Run("partial match not invalid", func(t *testing.T) {
		if isInvalidCoordinates(models.Coordinates{X: -1, Y: 0}) {
			t.Error("{-1,0} should be valid (partial match of sentinel)")
		}
	})
}

// ──────────────────────────────────────────────────
// calculateDayDistanceScore
// ──────────────────────────────────────────────────

func TestCalculateDayDistanceScore(t *testing.T) {
	noRecordings := map[string]struct{}{}

	t.Run("empty slots returns 0", func(t *testing.T) {
		score := calculateDayDistanceScore(nil, noRecordings)
		if score != 0 {
			t.Errorf("got %v, want 0", score)
		}
	})

	t.Run("single slot returns 0", func(t *testing.T) {
		slot := makeSlotWithCoords("A|Lecture", "Monday", "0900", "1000",
			models.Coordinates{X: 103.77, Y: 1.29})
		score := calculateDayDistanceScore([]models.ModuleSlot{slot}, noRecordings)
		if score != 0 {
			t.Errorf("got %v, want 0 for single slot", score)
		}
	})

	t.Run("both slots recorded skips pair penalty", func(t *testing.T) {
		recordings := map[string]struct{}{"A|Lecture": {}, "B|Tutorial": {}}
		s1 := makeSlotWithCoords("A|Lecture", "Monday", "0900", "1000", constants.InvalidCoordinates)
		s2 := makeSlotWithCoords("B|Tutorial", "Monday", "1000", "1100", constants.InvalidCoordinates)
		score := calculateDayDistanceScore([]models.ModuleSlot{s1, s2}, recordings)
		if score != 0 {
			t.Errorf("got %v, want 0 when both slots are recorded", score)
		}
	})

	t.Run("first slot recorded skips pair", func(t *testing.T) {
		recordings := map[string]struct{}{"A|Lecture": {}}
		s1 := makeSlotWithCoords("A|Lecture", "Monday", "0900", "1000", constants.InvalidCoordinates)
		s2 := makeSlotWithCoords("B|Tutorial", "Monday", "1000", "1100", constants.InvalidCoordinates)
		score := calculateDayDistanceScore([]models.ModuleSlot{s1, s2}, recordings)
		if score != 0 {
			t.Errorf("got %v, want 0 when first slot is recorded", score)
		}
	})

	t.Run("both slots with invalid coords adds NoVenuePenalty", func(t *testing.T) {
		s1 := makeSlot("A|Lecture", "Monday", "0900", "1000")  // has InvalidCoordinates from makeSlot
		s2 := makeSlot("B|Tutorial", "Monday", "1000", "1100") // has InvalidCoordinates from makeSlot
		score := calculateDayDistanceScore([]models.ModuleSlot{s1, s2}, noRecordings)
		if score != constants.NoVenuePenalty {
			t.Errorf("got %v, want %v (NoVenuePenalty)", score, constants.NoVenuePenalty)
		}
	})

	t.Run("second slot with invalid coords adds NoVenuePenalty", func(t *testing.T) {
		s1 := makeSlotWithCoords("A|Lecture", "Monday", "0900", "1000",
			models.Coordinates{X: 103.77, Y: 1.29})
		s2 := makeSlot("B|Tutorial", "Monday", "1000", "1100") // InvalidCoordinates
		score := calculateDayDistanceScore([]models.ModuleSlot{s1, s2}, noRecordings)
		if score != constants.NoVenuePenalty {
			t.Errorf("got %v, want %v when second slot has invalid coords", score, constants.NoVenuePenalty)
		}
	})

	t.Run("same valid coords gives near-zero penalty", func(t *testing.T) {
		coord := models.Coordinates{X: 103.7748, Y: 1.2936}
		s1 := makeSlotWithCoords("A|Lecture", "Monday", "0900", "1000", coord)
		s2 := makeSlotWithCoords("B|Tutorial", "Monday", "1000", "1100", coord)
		score := calculateDayDistanceScore([]models.ModuleSlot{s1, s2}, noRecordings)
		if score > 0.001 {
			t.Errorf("same-venue distance penalty = %v, want ~0", score)
		}
	})

	t.Run("far-apart valid coords gives positive penalty", func(t *testing.T) {
		// COM1 area vs BIZ area — roughly 400m apart
		s1 := makeSlotWithCoords("A|Lecture", "Monday", "0900", "1000",
			models.Coordinates{X: 103.7716, Y: 1.2952})
		s2 := makeSlotWithCoords("B|Tutorial", "Monday", "1000", "1100",
			models.Coordinates{X: 103.7748, Y: 1.2936})
		score := calculateDayDistanceScore([]models.ModuleSlot{s1, s2}, noRecordings)
		if score <= 0 {
			t.Errorf("expected positive penalty for far-apart venues, got %v", score)
		}
	})

	t.Run("three slots accumulates penalty over all pairs", func(t *testing.T) {
		s1 := makeSlot("A|Lecture", "Monday", "0900", "1000")  // InvalidCoords
		s2 := makeSlot("B|Tutorial", "Monday", "1000", "1100") // InvalidCoords
		s3 := makeSlot("C|Lab", "Monday", "1100", "1200")      // InvalidCoords
		score := calculateDayDistanceScore([]models.ModuleSlot{s1, s2, s3}, noRecordings)
		if score != 2*constants.NoVenuePenalty {
			t.Errorf("got %v, want %v (2 pairs × NoVenuePenalty)", score, 2*constants.NoVenuePenalty)
		}
	})
}

// ──────────────────────────────────────────────────
// getPhysicalSlots
// ──────────────────────────────────────────────────

func TestGetPhysicalSlots(t *testing.T) {
	s1 := makeSlot("A|Lecture", "Monday", "0900", "1000")
	s2 := makeSlot("B|Tutorial", "Monday", "1000", "1100")
	s3 := makeSlot("C|Lab", "Monday", "1100", "1200")

	t.Run("no recordings returns original slice", func(t *testing.T) {
		result := getPhysicalSlots([]models.ModuleSlot{s1, s2}, map[string]struct{}{})
		if len(result) != 2 {
			t.Errorf("got %d slots, want 2", len(result))
		}
	})

	t.Run("empty daySlots returns empty", func(t *testing.T) {
		result := getPhysicalSlots([]models.ModuleSlot{}, map[string]struct{}{"A|Lecture": {}})
		if len(result) != 0 {
			t.Errorf("got %d slots, want 0", len(result))
		}
	})

	t.Run("all recorded returns empty", func(t *testing.T) {
		recordings := map[string]struct{}{"A|Lecture": {}, "B|Tutorial": {}}
		result := getPhysicalSlots([]models.ModuleSlot{s1, s2}, recordings)
		if len(result) != 0 {
			t.Errorf("got %d slots, want 0 when all are recorded", len(result))
		}
	})

	t.Run("mixed returns only physical", func(t *testing.T) {
		recordings := map[string]struct{}{"B|Tutorial": {}}
		result := getPhysicalSlots([]models.ModuleSlot{s1, s2, s3}, recordings)
		if len(result) != 2 {
			t.Errorf("got %d slots, want 2", len(result))
		}
		for _, s := range result {
			if s.LessonKey == "B|Tutorial" {
				t.Error("recorded slot should not appear in physical slots")
			}
		}
	})

	t.Run("nil recordings returns original", func(t *testing.T) {
		// nil recordings means len(recordings)==0, returns daySlots as-is
		result := getPhysicalSlots([]models.ModuleSlot{s1, s2}, nil)
		if len(result) != 2 {
			t.Errorf("got %d slots, want 2 for nil recordings", len(result))
		}
	})
}

// ──────────────────────────────────────────────────
// calculateLunchGap  (lunchStart=720=12:00, lunchEnd=840=14:00)
// ──────────────────────────────────────────────────

func TestCalculateLunchGap(t *testing.T) {
	req := lunchReq(720, 840, 4) // 12:00–14:00 lunch window

	t.Run("empty slots returns LunchRequiredTime", func(t *testing.T) {
		gap := calculateLunchGap(nil, req)
		if gap != constants.LunchRequiredTime {
			t.Errorf("got %d, want %d", gap, constants.LunchRequiredTime)
		}
	})

	t.Run("single morning class leaves full lunch window", func(t *testing.T) {
		// Class 08:00–09:00, nothing during 12:00–14:00
		slot := models.ModuleSlot{StartMin: 480, EndMin: 540}
		gap := calculateLunchGap([]models.ModuleSlot{slot}, req)
		// gap after last class: 840 - max(540, 720) = 840 - 720 = 120
		if gap != 120 {
			t.Errorf("got %d, want 120", gap)
		}
	})

	t.Run("single class ending during lunch window", func(t *testing.T) {
		// Class 11:00–13:00 (660–780), lunch start at 12:00
		slot := models.ModuleSlot{StartMin: 660, EndMin: 780}
		gap := calculateLunchGap([]models.ModuleSlot{slot}, req)
		// gap after: 840 - max(780, 720) = 840 - 780 = 60
		if gap != 60 {
			t.Errorf("got %d, want 60", gap)
		}
	})

	t.Run("single class spanning entire lunch window", func(t *testing.T) {
		// Class 12:00–14:00 (720–840)
		slot := models.ModuleSlot{StartMin: 720, EndMin: 840}
		gap := calculateLunchGap([]models.ModuleSlot{slot}, req)
		if gap != 0 {
			t.Errorf("got %d, want 0 when class spans entire lunch window", gap)
		}
	})

	t.Run("single afternoon class leaves full lunch window via gap-before", func(t *testing.T) {
		// Class 14:00–15:00 (840–900), starts exactly at lunchEnd
		slot := models.ModuleSlot{StartMin: 840, EndMin: 900}
		// gap before: 840 > 720? yes. gap = min(840,840)-720 = 120.
		gap := calculateLunchGap([]models.ModuleSlot{slot}, req)
		if gap != 120 {
			t.Errorf("got %d, want 120", gap)
		}
	})

	t.Run("gap between two classes inside lunch window", func(t *testing.T) {
		// Class1: 09:00–12:00 (540–720), Class2: 13:00–15:00 (780–900)
		// Between gap: gapStart=max(720,720)=720, gapEnd=min(780,840)=780, gap=60
		s1 := models.ModuleSlot{StartMin: 540, EndMin: 720}
		s2 := models.ModuleSlot{StartMin: 780, EndMin: 900}
		gap := calculateLunchGap([]models.ModuleSlot{s1, s2}, req)
		if gap != 60 {
			t.Errorf("got %d, want 60", gap)
		}
	})

	t.Run("two classes with gap spanning entire lunch window", func(t *testing.T) {
		// Class1: 11:00–12:00 (660–720), Class2: 14:00–15:00 (840–900)
		// Between gap: gapStart=max(720,720)=720, gapEnd=min(840,840)=840, gap=120
		s1 := models.ModuleSlot{StartMin: 660, EndMin: 720}
		s2 := models.ModuleSlot{StartMin: 840, EndMin: 900}
		gap := calculateLunchGap([]models.ModuleSlot{s1, s2}, req)
		if gap != 120 {
			t.Errorf("got %d, want 120", gap)
		}
	})

	t.Run("back-to-back classes covering lunch gives zero gap", func(t *testing.T) {
		// Class1: 11:00–12:00 (660–720), Class2: 12:00–14:00 (720–840)
		s1 := models.ModuleSlot{StartMin: 660, EndMin: 720}
		s2 := models.ModuleSlot{StartMin: 720, EndMin: 840}
		gap := calculateLunchGap([]models.ModuleSlot{s1, s2}, req)
		if gap != 0 {
			t.Errorf("got %d, want 0 for back-to-back classes covering lunch", gap)
		}
	})
}

// ──────────────────────────────────────────────────
// calculateLargestGap
// ──────────────────────────────────────────────────

func TestCalculateLargestGap(t *testing.T) {
	tests := []struct {
		name    string
		slots   []models.ModuleSlot
		wantGap int
	}{
		{
			"empty slots",
			nil,
			0,
		},
		{
			"single slot",
			[]models.ModuleSlot{{StartMin: 540, EndMin: 600}},
			0,
		},
		{
			"two adjacent slots",
			[]models.ModuleSlot{{StartMin: 540, EndMin: 600}, {StartMin: 600, EndMin: 660}},
			0,
		},
		{
			"two slots with 90 min gap",
			[]models.ModuleSlot{{StartMin: 540, EndMin: 600}, {StartMin: 690, EndMin: 750}},
			90,
		},
		{
			"three slots picks largest gap",
			[]models.ModuleSlot{
				{StartMin: 540, EndMin: 600}, // 09:00–10:00
				{StartMin: 660, EndMin: 720}, // 11:00–12:00, gap=60
				{StartMin: 900, EndMin: 960}, // 15:00–16:00, gap=180
			},
			180,
		},
		{
			"large gap between first and second",
			[]models.ModuleSlot{
				{StartMin: 480, EndMin: 540},  // 08:00–09:00
				{StartMin: 900, EndMin: 960},  // 15:00–16:00, gap=360
				{StartMin: 960, EndMin: 1020}, // 16:00–17:00, gap=0
			},
			360,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := calculateLargestGap(tt.slots)
			if got != tt.wantGap {
				t.Errorf("calculateLargestGap() = %d, want %d", got, tt.wantGap)
			}
		})
	}
}

// ──────────────────────────────────────────────────
// penaliseConsecutiveHoursOfStudy
// ──────────────────────────────────────────────────

func TestPenaliseConsecutiveHoursOfStudy(t *testing.T) {
	tests := []struct {
		name               string
		consecutiveMinutes int
		maxHours           int
		want               int
	}{
		{"zero minutes no penalty", 0, 4, 0},
		{"1 hour under 4h limit", 60, 4, 0},
		{"exactly 4h at limit", 240, 4, 0},
		{"4h 1min: integer division rounds down to 4h, no penalty", 241, 4, 0},
		{"exactly 5h: 1h over", 300, 4, constants.ConsecutiveHoursPenaltyRate},
		{"exactly 6h: 2h over", 360, 4, 2 * constants.ConsecutiveHoursPenaltyRate},
		{"8h: 4h over", 480, 4, 4 * constants.ConsecutiveHoursPenaltyRate},
		{"2h with max=2 at limit", 120, 2, 0},
		{"3h with max=2: 1h over", 180, 2, constants.ConsecutiveHoursPenaltyRate},
		{"max=0 every class penalised", 60, 0, constants.ConsecutiveHoursPenaltyRate},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := penaliseConsecutiveHoursOfStudy(tt.consecutiveMinutes, tt.maxHours)
			if got != tt.want {
				t.Errorf("penaliseConsecutiveHoursOfStudy(%d, %d) = %d, want %d",
					tt.consecutiveMinutes, tt.maxHours, got, tt.want)
			}
		})
	}
}

// ──────────────────────────────────────────────────
// scoreConsecutiveHoursOfStudy
// ──────────────────────────────────────────────────

func TestScoreConsecutiveHoursOfStudy(t *testing.T) {
	slot := func(startMin, endMin int) models.ModuleSlot {
		return models.ModuleSlot{StartMin: startMin, EndMin: endMin}
	}

	tests := []struct {
		name     string
		slots    []models.ModuleSlot
		maxHours int
		want     int
	}{
		{
			"empty slots",
			nil, 4, 0,
		},
		{
			"single 2h class under 4h limit",
			[]models.ModuleSlot{slot(480, 600)}, 4, 0,
		},
		{
			"single 5h class (300 min), 1h over max=4",
			[]models.ModuleSlot{slot(480, 780)}, 4,
			constants.ConsecutiveHoursPenaltyRate,
		},
		{
			"two back-to-back 2h classes = 4h, at limit",
			// 09:00–11:00, 11:00–13:00
			[]models.ModuleSlot{slot(540, 660), slot(660, 780)}, 4, 0,
		},
		{
			"two back-to-back 3h classes = 6h, 2h over max=4",
			// 09:00–12:00, 12:00–15:00
			[]models.ModuleSlot{slot(540, 720), slot(720, 900)}, 4,
			2 * constants.ConsecutiveHoursPenaltyRate,
		},
		{
			"two separate 3h classes with gap, each under limit",
			// 09:00–12:00, 13:00–16:00
			[]models.ModuleSlot{slot(540, 720), slot(780, 960)}, 4, 0,
		},
		{
			"two separate 3h classes with gap, each 1h over max=2",
			// 09:00–12:00, 13:00–16:00
			[]models.ModuleSlot{slot(540, 720), slot(780, 960)}, 2,
			2 * constants.ConsecutiveHoursPenaltyRate,
		},
		{
			"three consecutive 2h classes = 6h, 2h over max=4",
			// 08:00–10:00, 10:00–12:00, 12:00–14:00
			[]models.ModuleSlot{slot(480, 600), slot(600, 720), slot(720, 840)}, 4,
			2 * constants.ConsecutiveHoursPenaltyRate,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := scoreConsecutiveHoursOfStudy(tt.slots, tt.maxHours)
			if got != tt.want {
				t.Errorf("scoreConsecutiveHoursOfStudy() = %d, want %d", got, tt.want)
			}
		})
	}
}

// ──────────────────────────────────────────────────
// scoreTimetableState
// ──────────────────────────────────────────────────

func TestScoreTimetableState(t *testing.T) {
	noRecordings := map[string]struct{}{}

	t.Run("all empty days contributes only TotalDistance", func(t *testing.T) {
		state := models.TimetableState{
			Assignments:   make(map[string]string),
			TotalDistance: 50.0,
		}
		for d := range state.DaySlots {
			state.DaySlots[d] = make([]models.ModuleSlot, 0)
		}
		req := lunchReq(720, 840, 4)
		score := scoreTimetableState(state, noRecordings, req)
		if score != 50.0 {
			t.Errorf("got %v, want 50.0 (TotalDistance only)", score)
		}
	})

	t.Run("single morning class earns lunch bonus", func(t *testing.T) {
		// 08:00–09:00 on Monday, nothing in 12:00–14:00 lunch window
		slot := models.ModuleSlot{StartMin: 480, EndMin: 540}
		state := stateWithDay([]models.ModuleSlot{slot})
		req := lunchReq(720, 840, 4)
		score := scoreTimetableState(state, noRecordings, req)
		// calculateLunchGap = 120 >= 60 -> LunchBonus (-300), no gap, no consecutive penalty
		wantFromDay := constants.LunchBonus
		if score != float64(wantFromDay) {
			t.Errorf("got %v, want %v (LunchBonus)", score, float64(wantFromDay))
		}
	})

	t.Run("class spanning lunch window earns lunch penalty", func(t *testing.T) {
		// Class 12:00–14:00 covers entire lunch window
		slot := models.ModuleSlot{StartMin: 720, EndMin: 840}
		state := stateWithDay([]models.ModuleSlot{slot})
		req := lunchReq(720, 840, 4)
		score := scoreTimetableState(state, noRecordings, req)
		// calculateLunchGap = 0 < 60 -> NoLunchPenalty (+300)
		// consecutive hours = 120 min < 240 min max -> 0
		wantFromDay := constants.NoLunchPenalty
		if score != float64(wantFromDay) {
			t.Errorf("got %v, want %v (NoLunchPenalty)", score, float64(wantFromDay))
		}
	})

	t.Run("large gap between classes adds gap penalty", func(t *testing.T) {
		// 08:00–09:00, then 12:00–13:00 (gap = 180 min > 120 threshold)
		s1 := models.ModuleSlot{StartMin: 480, EndMin: 540}
		s2 := models.ModuleSlot{StartMin: 720, EndMin: 780}
		state := stateWithDay([]models.ModuleSlot{s1, s2})
		req := lunchReq(720, 840, 4)
		score := scoreTimetableState(state, noRecordings, req)

		// 60 min free after 13:00 (within lunch window) -> LunchBonus
		// 180 min gap between classes > 120 threshold -> gap penalty = 100*(180-120)/60 = 100
		// Two separate 1h classes -> no consecutive penalty
		expected := constants.LunchBonus + constants.GapPenaltyRate*float64(180-constants.GapPenaltyThreshold)/60
		if math.Abs(score-expected) > 0.01 {
			t.Errorf("got %v, want ~%v (LunchBonus + gap penalty)", score, expected)
		}
	})

	t.Run("excessive consecutive hours adds consecutive penalty", func(t *testing.T) {
		// Three back-to-back 2h classes = 6h total (2h over max=4)
		// 08:00–10:00, 10:00–12:00, 12:00–14:00
		s1 := models.ModuleSlot{StartMin: 480, EndMin: 600}
		s2 := models.ModuleSlot{StartMin: 600, EndMin: 720}
		s3 := models.ModuleSlot{StartMin: 720, EndMin: 840}
		state := stateWithDay([]models.ModuleSlot{s1, s2, s3})
		req := lunchReq(720, 840, 4)
		score := scoreTimetableState(state, noRecordings, req)

		// Classes run 08:00-14:00 with no breaks, so no lunch gap -> NoLunchPenalty (+300)
		// No gaps between classes -> no gap penalty
		// 6h consecutive = 2h over max (4h) -> +200
		expected := float64(constants.NoLunchPenalty) + float64(2*constants.ConsecutiveHoursPenaltyRate)
		if math.Abs(score-expected) > 0.01 {
			t.Errorf("got %v, want ~%v", score, expected)
		}
	})

	t.Run("TotalDistance added to score", func(t *testing.T) {
		// One morning slot (gets lunch bonus) with non-zero TotalDistance
		slot := models.ModuleSlot{StartMin: 480, EndMin: 540}
		state := stateWithDay([]models.ModuleSlot{slot})
		state.TotalDistance = 25.0
		req := lunchReq(720, 840, 4)
		score := scoreTimetableState(state, noRecordings, req)
		expected := float64(constants.LunchBonus) + 25.0
		if math.Abs(score-expected) > 0.01 {
			t.Errorf("got %v, want %v (LunchBonus + TotalDistance)", score, expected)
		}
	})
}
