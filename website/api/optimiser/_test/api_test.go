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
	solver "github.com/nusmodifications/nusmods/website/api/optimiser/_solver"
)

const baseURL = "http://localhost:8020/optimise"

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

	var result solver.SolveResponse
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
		Recordings:          []string{"CS2103T Lecture"},
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

	var result solver.SolveResponse
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
		Recordings:          []string{"CS2040S Lecture", "CS2030S Lecture", "ST2334 Lecture"},
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

	var result solver.SolveResponse
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

// helpers

// Day name constants for mapping
var dayNames = []string{"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"}

// validate checks that the timetable satisfies all constraints:
// - No time collisions between lessons on the same day
// - All lessons are within earliestTime and latestTime bounds
// - Free days have no lessons scheduled
// - Lessons marked as recordings should not appear in physical timetable
func validateTimetable(t *testing.T, result solver.SolveResponse, req models.OptimiserRequest) {
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

	// Build recordings set (format: "CS2040S Lecture")
	recordings := make(map[string]bool)
	for _, rec := range req.Recordings {
		recordings[rec] = true
	}

	for dayIdx, slots := range result.DaySlots {
		for i, slot := range slots {
			// Free days should only have recorded lessons (if any)
			if freeDays[dayIdx] {
				parts := strings.Split(slot.LessonKey, "|")
				if len(parts) == 2 {
					recordingKey := parts[0] + " " + parts[1]
					if !recordings[recordingKey] {
						t.Errorf("%s: Non-recorded lesson %s should not appear on free day",
							dayNames[dayIdx], recordingKey)
					}
				}
				continue
			}

			// Check earliest time constraint
			if slot.StartTime < req.EarliestTime {
				t.Errorf("%s: %s %s starts at %s, before earliest time %s",
					dayNames[dayIdx], slot.LessonType, slot.ClassNo, slot.StartTime, req.EarliestTime)
			}

			// Check latest time constraint
			if slot.EndTime > req.LatestTime {
				t.Errorf("%s: %s %s ends at %s, after latest time %s",
					dayNames[dayIdx], slot.LessonType, slot.ClassNo, slot.EndTime, req.LatestTime)
			}

			// Check for time collisions with subsequent lessons
			for j := i + 1; j < len(slots); j++ {
				other := slots[j]
				if slot.StartTime < other.EndTime && other.StartTime < slot.EndTime {
					t.Errorf("%s: Collision between %s %s (%s-%s) and %s %s (%s-%s)",
						dayNames[dayIdx],
						slot.LessonType, slot.ClassNo, slot.StartTime, slot.EndTime,
						other.LessonType, other.ClassNo, other.StartTime, other.EndTime)
				}
			}
		}
	}
}

func makeRequest(t *testing.T, req models.OptimiserRequest) (*http.Response, []byte) {
	t.Helper()

	body, err := json.Marshal(req)
	if err != nil {
		t.Fatalf("Failed to marshal request: %v", err)
	}

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Post(baseURL, "application/json", bytes.NewReader(body))
	if err != nil {
		t.Fatalf("Failed to send request: %v", err)
	}

	respBody, err := io.ReadAll(resp.Body)
	resp.Body.Close()
	if err != nil {
		t.Fatalf("Failed to read response: %v", err)
	}

	return resp, respBody
}
