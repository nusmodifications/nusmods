package test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"

	models "github.com/nusmodifications/nusmods/website/api/optimiser/_models"
)

const baseURL = "http://localhost:8020/optimise"

var client = &http.Client{Timeout: 60 * time.Second}

func TestOptimiser_SingleModule(t *testing.T) {
	req := models.OptimiserRequest{
		Modules:             []string{"CS2040S"},
		Recordings:          []string{},
		FreeDays:            []string{},
		EarliestTime:        "0800",
		LatestTime:          "1700",
		AcadYear:            "2025-2026",
		AcadSem:             1,
		MaxConsecutiveHours: 4,
		LunchStart:          "1200",
		LunchEnd:            "1400",
	}

	resp, body := makeRequest(t, req)

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200, got %d. Body: %s", resp.StatusCode, string(body))
	}

	var result models.SolveResponse
	if err := json.Unmarshal(body, &result); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	// Verify assignments exist
	if len(result.Assignments) == 0 {
		t.Error("Expected assignments, got none")
	}

	// Verify shareable link is present
	if result.ShareableLink == "" {
		t.Error("Expected shareable link, got empty string")
	}

	// Validate all constraints
	validateTimetable(t, result, req)

	t.Logf("✅ Single module test passed. Assignments: %v", result.Assignments)
	t.Logf("   Shareable link: %s", result.ShareableLink)
}

func TestOptimiser_NoCollisionBetween2Lessons(t *testing.T) {
	req := models.OptimiserRequest{
		Modules:             []string{"CS2103T", "BN1112"},
		Recordings:          []string{"CS2103T|Lecture"},
		FreeDays:            []string{},
		EarliestTime:        "0800",
		LatestTime:          "1900",
		AcadYear:            "2025-2026",
		AcadSem:             1,
		MaxConsecutiveHours: 4,
		LunchStart:          "1200",
		LunchEnd:            "1400",
	}

	resp, body := makeRequest(t, req)

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200, got %d. Body: %s", resp.StatusCode, string(body))
	}

	var result models.SolveResponse
	if err := json.Unmarshal(body, &result); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	// Verify assignments exist
	if len(result.Assignments) == 0 {
		t.Error("Expected assignments, got none")
	}

	// Verify shareable link is present
	if result.ShareableLink == "" {
		t.Error("Expected shareable link, got empty string")
	}

	// Validate all constraints
	validateTimetable(t, result, req)

	t.Logf("✅ No Collision Between 2 Lessons Passed. Assignments: %v", result.Assignments)
	t.Logf("   Shareable link: %s", result.ShareableLink)

}

func TestOptimiser_MultipleModulesWithFreeDays(t *testing.T) {
	req := models.OptimiserRequest{
		Modules:             []string{"CS2040S", "CS2030S", "ST2334", "IS1108", "GEA1000"},
		Recordings:          []string{"CS2040S|Lecture", "CS2030S|Lecture", "ST2334|Lecture"},
		FreeDays:            []string{"Monday", "Wednesday"},
		EarliestTime:        "0900",
		LatestTime:          "1900",
		AcadYear:            "2025-2026",
		AcadSem:             1,
		MaxConsecutiveHours: 4,
		LunchStart:          "1200",
		LunchEnd:            "1400",
	}

	resp, body := makeRequest(t, req)

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200, got %d. Body: %s", resp.StatusCode, string(body))
	}

	var result models.SolveResponse
	if err := json.Unmarshal(body, &result); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}
	// Verify assignments exist
	if len(result.Assignments) == 0 {
		t.Error("Expected assignments, got none")
	}

	// Verify shareable link is present
	if result.ShareableLink == "" {
		t.Error("Expected shareable link, got empty string")
	}

	// Validate all constraints
	validateTimetable(t, result, req)
	t.Logf("✅ Multiple Modules Passed. Assignments: %v", result.Assignments)
	t.Logf("   Shareable link: %s", result.ShareableLink)
}

// TestOptimiser_EmptyModules verifies that an empty modules list is rejected.
func TestOptimiser_EmptyModules(t *testing.T) {
	req := models.OptimiserRequest{
		Modules:             []string{},
		Recordings:          []string{},
		FreeDays:            []string{},
		EarliestTime:        "0800",
		LatestTime:          "1800",
		AcadYear:            "2025-2026",
		AcadSem:             1,
		MaxConsecutiveHours: 4,
		LunchStart:          "1200",
		LunchEnd:            "1400",
	}

	resp, _ := makeRequest(t, req)

	if resp.StatusCode == http.StatusOK {
		t.Errorf("Expected non-200 status for empty modules, got %d", resp.StatusCode)
	}
}

// TestOptimiser_InvalidTimeFormat verifies that a malformed time string is rejected.
func TestOptimiser_InvalidTimeFormat(t *testing.T) {
	req := models.OptimiserRequest{
		Modules:             []string{"CS2040S"},
		Recordings:          []string{},
		FreeDays:            []string{},
		EarliestTime:        "ABCD",
		LatestTime:          "1800",
		AcadYear:            "2025-2026",
		AcadSem:             1,
		MaxConsecutiveHours: 4,
		LunchStart:          "1200",
		LunchEnd:            "1400",
	}

	resp, _ := makeRequest(t, req)

	if resp.StatusCode == http.StatusOK {
		t.Errorf("Expected non-200 status for invalid time format, got %d", resp.StatusCode)
	}
}

// TestOptimiser_NonExistentModule verifies that an unknown module code is rejected.
func TestOptimiser_NonExistentModule(t *testing.T) {
	req := models.OptimiserRequest{
		Modules:             []string{"INVALID999"},
		Recordings:          []string{},
		FreeDays:            []string{},
		EarliestTime:        "0800",
		LatestTime:          "1800",
		AcadYear:            "2025-2026",
		AcadSem:             1,
		MaxConsecutiveHours: 4,
		LunchStart:          "1200",
		LunchEnd:            "1400",
	}

	resp, _ := makeRequest(t, req)

	if resp.StatusCode == http.StatusOK {
		t.Errorf("Expected non-200 status for non-existent module, got %d", resp.StatusCode)
	}
}

// TestOptimiser_MethodNotAllowed verifies that non-POST requests are rejected with 405.
func TestOptimiser_MethodNotAllowed(t *testing.T) {
	resp, err := client.Get(baseURL)
	if err != nil {
		t.Fatalf("Failed to send GET request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusMethodNotAllowed {
		t.Errorf("Expected status 405 for GET request, got %d", resp.StatusCode)
	}
}

// TestOptimiser_ShareableLinks verifies that both shareable links are well-formed
// and reference all requested module codes.
func TestOptimiser_ShareableLinks(t *testing.T) {
	req := models.OptimiserRequest{
		Modules:             []string{"CS2040S", "CS2030S"},
		Recordings:          []string{},
		FreeDays:            []string{},
		EarliestTime:        "0800",
		LatestTime:          "1900",
		AcadYear:            "2025-2026",
		AcadSem:             1,
		MaxConsecutiveHours: 4,
		LunchStart:          "1200",
		LunchEnd:            "1400",
	}

	resp, body := makeRequest(t, req)

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200, got %d. Body: %s", resp.StatusCode, string(body))
	}

	var result models.SolveResponse
	if err := json.Unmarshal(body, &result); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	const linkPrefix = "https://nusmods.com/timetable/"

	for _, link := range []string{result.ShareableLink, result.DefaultShareableLink} {
		if !strings.HasPrefix(link, linkPrefix) {
			t.Errorf("Link does not start with %q: %s", linkPrefix, link)
		}
		for _, module := range req.Modules {
			if !strings.Contains(link, module) {
				t.Errorf("Link missing module %q: %s", module, link)
			}
		}
	}

	t.Logf("✅ Shareable links valid. ShareableLink: %s", result.ShareableLink)
	t.Logf("   DefaultShareableLink: %s", result.DefaultShareableLink)
}

// TestOptimiser_AllSlotsHaveAssignments verifies that every slot in DaySlots has
// a corresponding entry in Assignments, ensuring internal result consistency.
func TestOptimiser_AllSlotsHaveAssignments(t *testing.T) {
	req := models.OptimiserRequest{
		Modules:             []string{"CS2040S", "CS2030S", "ST2334"},
		Recordings:          []string{"CS2040S|Lecture"},
		FreeDays:            []string{},
		EarliestTime:        "0800",
		LatestTime:          "1900",
		AcadYear:            "2025-2026",
		AcadSem:             1,
		MaxConsecutiveHours: 4,
		LunchStart:          "1200",
		LunchEnd:            "1400",
	}

	resp, body := makeRequest(t, req)

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200, got %d. Body: %s", resp.StatusCode, string(body))
	}

	var result models.SolveResponse
	if err := json.Unmarshal(body, &result); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	for dayIdx, slots := range result.DaySlots {
		for _, slot := range slots {
			if _, ok := result.Assignments[slot.LessonKey]; !ok {
				t.Errorf("%s: slot with lessonKey %q has no corresponding assignment",
					dayNames[dayIdx], slot.LessonKey)
			}
		}
	}

	t.Logf("✅ All slots have assignments. Assignments: %v", result.Assignments)
}

// helpers

// Day name constants for mapping
var dayNames = []string{"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"}

// validate checks that the timetable satisfies all constraints:
// - No time collisions between lessons on the same day
// - All lessons are within earliestTime and latestTime bounds
// - Free days have no lessons scheduled
// - Lessons marked as recordings should not appear in physical timetable
func validateTimetable(t *testing.T, result models.SolveResponse, req models.OptimiserRequest) {
	t.Helper()

	// Build free days set
	freeDays := make(map[int]bool)
	for _, day := range req.FreeDays {
		for idx, name := range dayNames {
			if day == name {
				freeDays[idx] = true
				break
			}
		}
	}

	// Build recordings set (format: "CS2040S|Lecture")
	recordings := make(map[string]bool)
	for _, rec := range req.Recordings {
		recordings[rec] = true
	}

	for dayIdx, slots := range result.DaySlots {
		for i, slot := range slots {
			// Free days should only have recorded lessons (if any)
			if freeDays[dayIdx] {
				if !recordings[slot.LessonKey] {
					t.Errorf("%s: Non-recorded lesson %s should not appear on free day",
						dayNames[dayIdx], slot.LessonKey)
				}
				continue
			}

			// Check earliest time constraint
			slotStartMin, _ := models.ParseTimeToMinutes(slot.StartTime)
			slotEndMin, _ := models.ParseTimeToMinutes(slot.EndTime)
			earliestMin, _ := models.ParseTimeToMinutes(req.EarliestTime)
			latestMin, _ := models.ParseTimeToMinutes(req.LatestTime)

			if slotStartMin < earliestMin {
				t.Errorf("%s: %s %s starts at %s, before earliest time %s",
					dayNames[dayIdx], slot.LessonType, slot.ClassNo, slot.StartTime, req.EarliestTime)
			}

			// Check latest time constraint
			if slotEndMin > latestMin {
				t.Errorf("%s: %s %s ends at %s, after latest time %s",
					dayNames[dayIdx], slot.LessonType, slot.ClassNo, slot.EndTime, req.LatestTime)
			}

			// Check for time collisions with subsequent lessons, accounting for weeks
			for j := i + 1; j < len(slots); j++ {
				other := slots[j]
				otherStartMin, _ := models.ParseTimeToMinutes(other.StartTime)
				otherEndMin, _ := models.ParseTimeToMinutes(other.EndTime)
				if slotStartMin < otherEndMin && otherStartMin < slotEndMin {
					// Slots overlap in time — only a real collision if they share a week
					if weeksOverlap(slot.WeeksSet, other.WeeksSet) {
						t.Errorf("%s: Collision between %s %s (%s-%s) and %s %s (%s-%s)",
							dayNames[dayIdx],
							slot.LessonType, slot.ClassNo, slot.StartTime, slot.EndTime,
							other.LessonType, other.ClassNo, other.StartTime, other.EndTime)
					}
				}
			}
		}
	}
}

// weeksOverlap returns true if two WeeksSets share at least one week.
// If either set is nil (weeks were not a []int), assumes overlap conservatively.
func weeksOverlap(a, b map[int]struct{}) bool {
	if a == nil || b == nil {
		return true
	}
	for week := range a {
		if _, exists := b[week]; exists {
			return true
		}
	}
	return false
}

func makeRequest(t *testing.T, req models.OptimiserRequest) (*http.Response, []byte) {
	t.Helper()

	body, err := json.Marshal(req)
	if err != nil {
		t.Fatalf("Failed to marshal request: %v", err)
	}

	resp, err := client.Post(baseURL, "application/json", bytes.NewReader(body))
	if err != nil {
		t.Fatalf("Failed to send request: %v", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("Failed to read response: %v", err)
	}

	return resp, respBody
}
