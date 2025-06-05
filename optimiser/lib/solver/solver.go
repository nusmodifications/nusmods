package solver

import (
	"encoding/json"
	"net/http"
	"sort"
	"strings"

	"github.com/nusmodifications/nusmods/optimiser/lib/models"
	"github.com/nusmodifications/nusmods/optimiser/lib/modules"
	"github.com/umahmood/haversine"
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
		
		// Parse all ModuleSlot groups once and populate computed fields.
		for lessonKey, slotGroups := range lessonToSlots {
			for _, group := range slotGroups {
				for i := range group {
					err := group[i].ParseModuleSlotFields(lessonKey)
					if err != nil {
						// Skip invalid slots
						group[i].DayIndex = -1
					}
				}
			}
		}
		
		// Initialize beam with one empty state
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
					
					// Filter out invalid slots (DayIndex == -1)
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
					
					// Store the classNo
					if len(validGroup) > 0 {
						newState.Assignments[lessonKey] = validGroup[0].ClassNo
					}
					
					// Track days that change, so we only recalc distance on those days
					for _, slot := range validGroup {
						d := slot.DayIndex
						
						// Subtract old day distance
						newState.TotalDistance -= newState.DayDistance[d]
						
						// Insert slot in sorted order
						newState.DaySlots[d] = insertSlotSorted(newState.DaySlots[d], slot)
						
						// Recompute day distance
						nd := calculateDayDistanceScore(newState.DaySlots[d], recordings)
						newState.DayDistance[d] = nd
						newState.TotalDistance += nd
					}
					
					nextBeam = append(nextBeam, newState)
				}
			}
			
			if len(nextBeam) == 0 {
				// No valid expansions at this depth
				return models.TimetableState{}
			}
			
			// Sort nextBeam by the new scoring function (lower is better)
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
	requestFormat := parts[0] + " " + parts[1]
	return recordings[requestFormat]
}

// calculateDayDistanceScore computes walking penalty for consecutive slots using haversine distance
func calculateDayDistanceScore(daySlots []models.ModuleSlot, recordings map[string]bool) float64 {
	if len(daySlots) <= 1 {
		return 0
	}

	const MAX_WALK_DISTANCE = 0.250 // 250 meters
	var totalPenalty float64

	for i := 1; i < len(daySlots); i++ {
		prev := daySlots[i-1]
		curr := daySlots[i]

		// Skip if coordinates are invalid (0,0)
		if prev.Coordinates.X == 0 || prev.Coordinates.Y == 0 || curr.Coordinates.X == 0 || curr.Coordinates.Y == 0 {
			continue
		}

		// Skip distance calculation if either lesson is recorded
		if isLessonRecorded(prev.LessonKey, recordings) || isLessonRecorded(curr.LessonKey, recordings) {
			continue
		}

		prevCoord := haversine.Coord{Lat: float64(prev.Coordinates.Y), Lon: float64(prev.Coordinates.X)}
		currCoord := haversine.Coord{Lat: float64(curr.Coordinates.Y), Lon: float64(curr.Coordinates.X)}
		_, km := haversine.Distance(prevCoord, currCoord)

		// Apply walking penalty formula - higher distances = higher penalty
		penalty := (10.0 / MAX_WALK_DISTANCE) * km
		totalPenalty += penalty
	}
	return totalPenalty
}

// hasConflict checks if any slot in newSlots overlaps with existing slots in state.
func hasConflict(state models.TimetableState, newSlots []models.ModuleSlot) bool {
	// slotsOverlap returns true if two ModuleSlots overlap in time.
	slotsOverlap := func(a, b models.ModuleSlot) bool {
		return a.StartMin < b.EndMin && b.StartMin < a.EndMin
	}
	for _, newSlot := range newSlots {
		existing := state.DaySlots[newSlot.DayIndex]
		for _, oldSlot := range existing {
			if slotsOverlap(oldSlot, newSlot) {
				return true
			}
		}
	}
	return false
}

// copyState creates a fresh copy of src, with new allocations (no pooling).
func copyState(src models.TimetableState) models.TimetableState {
	new := models.TimetableState{
		Assignments: make(map[string]string, len(src.Assignments)),
	}
	for i := 0; i < 5; i++ {
		new.DaySlots[i] = make([]models.ModuleSlot, 0, len(src.DaySlots[i]))
	}

	// Copy assignments
	for k, v := range src.Assignments {
		new.Assignments[k] = v
	}
	// Copy day slots
	for i := 0; i < 5; i++ {
		if len(src.DaySlots[i]) > 0 {
			new.DaySlots[i] = append(new.DaySlots[i], src.DaySlots[i]...)
		}
		new.DayDistance[i] = src.DayDistance[i]
	}
	new.TotalDistance = src.TotalDistance
	return new
}

// getPhysicalSlotsSorted gets sorted physical slots for a day
func getPhysicalSlotsSorted(daySlots []models.ModuleSlot, recordings map[string]bool) []models.ModuleSlot {
	if len(daySlots) <= 1 {
		return daySlots
	}

	// Sort slots by start time
	sorted := make([]models.ModuleSlot, len(daySlots))
	copy(sorted, daySlots)
	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].StartMin < sorted[j].StartMin
	})

	// Filter out recorded lessons
	physicalSlots := make([]models.ModuleSlot, 0, len(sorted))
	for _, slot := range sorted {
		if !isLessonRecorded(slot.LessonKey, recordings) {
			physicalSlots = append(physicalSlots, slot)
		}
	}

	return physicalSlots
}

// Calculate lunch gap for a day's physical slots
func calculateLunchGap(physicalSlots []models.ModuleSlot, optimiserRequest models.OptimiserRequest) int {
	if len(physicalSlots) == 0 {
		return 120 // Full lunch time available
	}

	LUNCH_START, _ := models.ParseTimeToMinutes(optimiserRequest.LunchStart) // 12:00 PM
	LUNCH_END, _   := models.ParseTimeToMinutes(optimiserRequest.LunchEnd) // 2:00 PM

	bestGap := 0

	// Gap before first class
	if physicalSlots[0].StartMin > LUNCH_START {
		gap := min(physicalSlots[0].StartMin, LUNCH_END) - LUNCH_START
		if gap > bestGap {
			bestGap = gap
		}
	}

	// Gaps between consecutive classes
	for i := 1; i < len(physicalSlots); i++ {
		prevEnd := physicalSlots[i-1].EndMin
		currStart := physicalSlots[i].StartMin

		gapStart := max(prevEnd, LUNCH_START)
		gapEnd := min(currStart, LUNCH_END)

		if gapStart < gapEnd {
			gap := gapEnd - gapStart
			if gap > bestGap {
				bestGap = gap
			}
		}
	}

	// Gap after last class
	lastSlot := physicalSlots[len(physicalSlots)-1]
	if lastSlot.EndMin < LUNCH_END {
		gap := LUNCH_END - max(lastSlot.EndMin, LUNCH_START)
		if gap > bestGap {
			bestGap = gap
		}
	}

	return bestGap
}

// scoreTimetableState assigns a heuristic score to a complete timetable state.
// Lower score means a better (more preferred) timetable.
func scoreTimetableState(state models.TimetableState, recordings map[string]bool, optimiserRequest models.OptimiserRequest) float64 {
	const (
		LUNCH_BONUS      = -300.0
		NO_LUNCH_PENALTY = 300.0
	)

	var totalScore float64
	for d := 0; d < 5; d++ {
		if len(state.DaySlots[d]) == 0 {
			continue
		}
		// Get physical slots for this day (exclude recorded lessons)
		physicalSlots := getPhysicalSlotsSorted(state.DaySlots[d], recordings)
		// Calculate lunch gap for this day
		lunchGap := calculateLunchGap(physicalSlots, optimiserRequest)
		// Apply lunch penalty/bonus
		if lunchGap >= 60 {
			totalScore += LUNCH_BONUS // -300
		} else {
			totalScore += NO_LUNCH_PENALTY // +300
		}

		// Find largest gap between physical slots
		largestGap := calculateLargestGap(physicalSlots)
		// for every hour greater than 2 hours, add 100 to score
		if largestGap > 120 {
			totalScore += 100 * float64(largestGap - 120)/60
		}
	}
	// Add walking penalty 
	totalScore += state.TotalDistance

	return totalScore
}

func calculateLargestGap(physicalSlots []models.ModuleSlot) int {
	largestGap := 0

	for i := 1; i < len(physicalSlots); i++ {
		prevEnd := physicalSlots[i-1].EndMin
		currStart := physicalSlots[i].StartMin

		gap := currStart - prevEnd
		if gap > largestGap {
			largestGap = gap
		}
	}

	return largestGap
}

// SolveResponse wraps the TimetableState with additional metadata including the shareable link
type SolveResponse struct {
	models.TimetableState
	ShareableLink string `json:"shareableLink"`
}
	
// Solve is the HTTP handler that reads an OptimiserRequest, runs BeamSearch, and writes JSON.
func Solve(w http.ResponseWriter, req models.OptimiserRequest) {
	slots, err := modules.GetAllModuleSlots(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Build recordings map for fast lookup
	recordings := make(map[string]bool, len(req.Recordings))
	for _, recording := range req.Recordings {
		recordings[recording] = true
	}

	// Build lesson keys and their slot groups
	var lessons []string
	lessonToSlots := make(map[string][][]models.ModuleSlot, len(slots))
	for module, ltMap := range slots {
		for lt, groups := range ltMap {
			key := strings.ToUpper(module) + "|" + strings.ToUpper(lt)
			lessons = append(lessons, key)
			for _, grp := range groups {
				lessonToSlots[key] = append(lessonToSlots[key], grp)
			}
		}
	}

	// Sort lessons by MRV heuristic (fewest slot-groups first)
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

// min returns the smaller of a and b.
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// max returns the larger of a and b.
func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
