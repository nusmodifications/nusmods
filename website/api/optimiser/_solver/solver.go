package solver

import (
	"encoding/json"
	"net/http"
	"sort"
	"strings"

	models "github.com/nusmodifications/nusmods/website/api/optimiser/optimise/_models"
	modules "github.com/nusmodifications/nusmods/website/api/optimiser/optimise/_modules"
	"github.com/umahmood/haversine"
)

// Constants
const (
	MAX_WALK_DISTANCE     = 0.250 // 250 meters
	LUNCH_BONUS           = -300.0
	NO_LUNCH_PENALTY      = 300.0
	GAP_PENALTY_THRESHOLD = 120 // 2 hours in minutes
	GAP_PENALTY_RATE      = 100.0
	LUNCH_REQUIRED_TIME   = 60 // 1 hour in minutes
)

/*
Beam Search Algorithm
https://www.geeksforgeeks.org/introduction-to-beam-search-algorithm/
*/
func BeamSearch(
	lessons []string,
	lessonToSlots map[string][][]models.ModuleSlot,
	beamWidth int,
	branchingFactor int,
	recordings map[string]bool,
	optimiserRequest models.OptimiserRequest) models.TimetableState {

	for lessonKey, slotGroups := range lessonToSlots {
		for _, group := range slotGroups {
			for i := range group {
				if err := group[i].ParseModuleSlotFields(lessonKey); err != nil {
					// Skip invalid slots
					group[i].DayIndex = -1
				}
			}
		}
	}

	initial := models.TimetableState{
		Assignments: make(map[string]string),
	}
	for d := 0; d < 5; d++ {
		initial.DaySlots[d] = make([]models.ModuleSlot, 0)
	}
	beam := []models.TimetableState{initial}

	for _, lessonKey := range lessons {
		var nextBeam []models.TimetableState
		slotGroups := lessonToSlots[lessonKey]
		limit := min(len(slotGroups), branchingFactor)

		for _, state := range beam {
			for i := 0; i < limit; i++ {
				group := slotGroups[i]

				validGroup := make([]models.ModuleSlot, 0, len(group))
				for _, slot := range group {
					if slot.DayIndex >= 0 && slot.DayIndex < 5 {
						validGroup = append(validGroup, slot)
					}
				}

				if len(validGroup) == 0 || hasConflict(state, validGroup) {
					continue
				}

				newState := copyState(state)
				newState.Assignments[lessonKey] = validGroup[0].ClassNo

				// Track days that change, so we only recalc distance on those days
				for _, slot := range validGroup {
					d := slot.DayIndex

					newState.TotalDistance -= newState.DayDistance[d]

					newState.DaySlots[d] = insertSlotSorted(newState.DaySlots[d], slot)
					newState.DayDistance[d] = calculateDayDistanceScore(newState.DaySlots[d], recordings)
					newState.TotalDistance += newState.DayDistance[d]
				}

				nextBeam = append(nextBeam, newState)
			}
		}

		if len(nextBeam) == 0 {
			return models.TimetableState{}
		}

		sort.Slice(nextBeam, func(i, j int) bool {
			return scoreTimetableState(nextBeam[i], recordings, optimiserRequest) < scoreTimetableState(nextBeam[j], recordings, optimiserRequest)
		})

		// Prune to beamWidth
		if len(nextBeam) > beamWidth {
			nextBeam = nextBeam[:beamWidth]
		}

		beam = nextBeam
	}

	return beam[0]
}

// insertSlotSorted inserts newSlot into daySlots (sorted by StartMin) and returns the new slice.
func insertSlotSorted(daySlots []models.ModuleSlot, newSlot models.ModuleSlot) []models.ModuleSlot {
	left, right := 0, len(daySlots)
	for left < right {
		mid := (left + right) / 2
		if daySlots[mid].StartMin <= newSlot.StartMin {
			left = mid + 1
		} else {
			right = mid
		}
	}
	daySlots = append(daySlots, models.ModuleSlot{})
	copy(daySlots[left+1:], daySlots[left:])
	daySlots[left] = newSlot
	return daySlots
}

// isLessonRecorded checks if a lesson is recorded based on user request
func isLessonRecorded(lessonKey string, recordings map[string]bool) bool {
	// Convert lessonKey from "MODULE|LessonType" to "MODULE LessonType" format
	parts := strings.Split(lessonKey, "|")
	if len(parts) != 2 {
		return false
	}
	return recordings[parts[0]+" "+parts[1]]
}

// calculateDayDistanceScore computes walking penalty for consecutive slots using haversine distance
func calculateDayDistanceScore(daySlots []models.ModuleSlot, recordings map[string]bool) float64 {
	if len(daySlots) <= 1 {
		return 0
	}

	var totalPenalty float64

	for i := 1; i < len(daySlots); i++ {
		prev := daySlots[i-1]
		curr := daySlots[i]

		// Skip if coordinates are invalid (0,0) or either lesson is recorded
		if prev.Coordinates.X == 0 || prev.Coordinates.Y == 0 ||
			curr.Coordinates.X == 0 || curr.Coordinates.Y == 0 ||
			isLessonRecorded(prev.LessonKey, recordings) ||
			isLessonRecorded(curr.LessonKey, recordings) {
			continue
		}

		prevCoord := haversine.Coord{Lat: float64(prev.Coordinates.Y), Lon: float64(prev.Coordinates.X)}
		currCoord := haversine.Coord{Lat: float64(curr.Coordinates.Y), Lon: float64(curr.Coordinates.X)}
		_, km := haversine.Distance(prevCoord, currCoord)

		// Apply walking penalty formula
		// A linear penalty applied. Change if a better heuristic is found. Works as of 6/6/2025.
		totalPenalty += (10.0 / MAX_WALK_DISTANCE) * km
	}
	return totalPenalty
}

// hasConflict checks if any slot in newSlots overlaps with existing slots in state.
func hasConflict(state models.TimetableState, newSlots []models.ModuleSlot) bool {
	for _, newSlot := range newSlots {
		for _, oldSlot := range state.DaySlots[newSlot.DayIndex] {
			// Check if slots overlap in time
			if newSlot.StartMin < oldSlot.EndMin && oldSlot.StartMin < newSlot.EndMin {
				return true
			}
		}
	}
	return false
}

// copyState creates a fresh copy of src
func copyState(src models.TimetableState) models.TimetableState {
	newState := models.TimetableState{
		Assignments:   make(map[string]string, len(src.Assignments)),
		DayDistance:   src.DayDistance,
		TotalDistance: src.TotalDistance,
	}

	// Copy assignments
	for k, v := range src.Assignments {
		newState.Assignments[k] = v
	}

	// Copy day slots
	for i := 0; i < 5; i++ {
		if len(src.DaySlots[i]) > 0 {
			newState.DaySlots[i] = make([]models.ModuleSlot, len(src.DaySlots[i]))
			copy(newState.DaySlots[i], src.DaySlots[i])
		} else {
			newState.DaySlots[i] = make([]models.ModuleSlot, 0)
		}
	}

	return newState
}

// getPhysicalSlots filters out recorded lessons from daySlots
func getPhysicalSlots(daySlots []models.ModuleSlot, recordings map[string]bool) []models.ModuleSlot {
	if len(daySlots) == 0 {
		return daySlots
	}

	physicalSlots := make([]models.ModuleSlot, 0, len(daySlots))
	for _, slot := range daySlots {
		if !isLessonRecorded(slot.LessonKey, recordings) {
			physicalSlots = append(physicalSlots, slot)
		}
	}

	return physicalSlots
}

// calculateLunchGap calculates the best lunch gap for a day's physical slots
func calculateLunchGap(physicalSlots []models.ModuleSlot, optimiserRequest models.OptimiserRequest) int {
	if len(physicalSlots) == 0 {
		return LUNCH_REQUIRED_TIME
	}

	lunchStart, _ := models.ParseTimeToMinutes(optimiserRequest.LunchStart)
	lunchEnd, _ := models.ParseTimeToMinutes(optimiserRequest.LunchEnd)
	bestGap := 0

	// Gap before first class
	if physicalSlots[0].StartMin > lunchStart {
		gap := min(physicalSlots[0].StartMin, lunchEnd) - lunchStart
		if gap > bestGap {
			bestGap = gap
		}
	}

	// Gaps between consecutive classes
	for i := 1; i < len(physicalSlots); i++ {
		gapStart := max(physicalSlots[i-1].EndMin, lunchStart)
		gapEnd := min(physicalSlots[i].StartMin, lunchEnd)

		if gapStart < gapEnd {
			gap := gapEnd - gapStart
			if gap > bestGap {
				bestGap = gap
			}
		}
	}

	// Gap after last class
	lastSlot := physicalSlots[len(physicalSlots)-1]
	if lastSlot.EndMin < lunchEnd {
		gap := lunchEnd - max(lastSlot.EndMin, lunchStart)
		if gap > bestGap {
			bestGap = gap
		}
	}

	return bestGap
}

/*
scoreTimetableState assigns a heuristic score to a complete timetable state.
Lower score means a better (more preferred) timetable.
*/
func scoreTimetableState(state models.TimetableState, recordings map[string]bool, optimiserRequest models.OptimiserRequest) float64 {
	var totalScore float64
	for d := 0; d < 5; d++ {
		if len(state.DaySlots[d]) == 0 {
			continue
		}

		physicalSlots := getPhysicalSlots(state.DaySlots[d], recordings)

		// Apply lunch penalty/bonus
		lunchGap := calculateLunchGap(physicalSlots, optimiserRequest)
		if lunchGap >= LUNCH_REQUIRED_TIME {
			totalScore += LUNCH_BONUS
		} else {
			totalScore += NO_LUNCH_PENALTY
		}

		// Apply gap penalty for large gaps of > 2 hours between classes
		largestGap := calculateLargestGap(physicalSlots)
		if largestGap > GAP_PENALTY_THRESHOLD {
			totalScore += GAP_PENALTY_RATE * float64(largestGap-GAP_PENALTY_THRESHOLD) / 60
		}
	}

	// Add penalty for walking distance
	return totalScore + state.TotalDistance
}

// calculateLargestGap finds the largest gap between consecutive physical slots
func calculateLargestGap(physicalSlots []models.ModuleSlot) int {
	largestGap := 0
	for i := 1; i < len(physicalSlots); i++ {
		gap := physicalSlots[i].StartMin - physicalSlots[i-1].EndMin
		if gap > largestGap {
			largestGap = gap
		}
	}
	return largestGap
}

type SolveResponse struct {
	models.TimetableState
	ShareableLink string `json:"shareableLink"`
}

func Solve(w http.ResponseWriter, req models.OptimiserRequest) {
	slots, err := modules.GetAllModuleSlots(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	recordings := make(map[string]bool, len(req.Recordings))
	for _, recording := range req.Recordings {
		recordings[recording] = true
	}

	var lessons []string
	lessonToSlots := make(map[string][][]models.ModuleSlot, len(slots))
	for module, ltMap := range slots {
		for lt, groups := range ltMap {
			key := strings.ToUpper(module) + "|" + lt
			lessons = append(lessons, key)
			for _, grp := range groups {
				lessonToSlots[key] = append(lessonToSlots[key], grp)
			}
		}
	}

	/*
		Sort lessons by Minimum Remaining Value (MRV) heuristic
	*/
	sort.Slice(lessons, func(i, j int) bool {
		return len(lessonToSlots[lessons[i]]) < len(lessonToSlots[lessons[j]])
	})

	best := BeamSearch(lessons, lessonToSlots, 2500, 100, recordings, req)
	shareableLink := GenerateNUSModsShareableLinkFromAssignments(best.Assignments, req)
	response := SolveResponse{
		TimetableState: best,
		ShareableLink:  shareableLink,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
