package solver

import (
	"encoding/json"
	"net/http"
	"sort"
	"strings"

	"github.com/umahmood/haversine"

	constants "github.com/nusmodifications/nusmods/website/api/optimiser/_constants"
	models "github.com/nusmodifications/nusmods/website/api/optimiser/_models"
	modules "github.com/nusmodifications/nusmods/website/api/optimiser/_modules"
)

// BeamSearch explores the space of possible timetables to find the optimal assignment.
// It uses a beam search algorithm to efficiently handle the exponentially large search space
// by maintaining only the top beamWidth most promising partial timetables at each step.
//
// Algorithm flow:
//  1. Start with an empty timetable
//  2. For each lesson type (e.g., CS1010S Lecture), try different class options (e.g., class 1, 2, 3)
//  3. Keep only the best beamWidth partial timetables based on scoring (prune the rest)
//  4. Repeat until all lessons are assigned
//
// Parameters:
//   - lessons: Ordered list of lesson keys (e.g., "CS1010S|Lecture")
//   - lessonToSlots: Maps each lesson key to its available class options
//   - beamWidth: Maximum number of partial timetables to keep at each step (trades quality for speed)
//   - branchingFactor: Maximum number of class options to try per lesson (limits exploration)
//   - recordings: Set of recorded/online lessons that don't count for physical constraints
//   - optimiserRequest: User preferences (free days, time ranges, etc.)
//
// Returns the best complete timetable found.
// Reference: https://www.geeksforgeeks.org/introduction-to-beam-search-algorithm/
func BeamSearch(
	lessons []string,
	lessonToSlots map[string][][]models.ModuleSlot,
	beamWidth int,
	branchingFactor int,
	recordings map[string]bool,
	optimiserRequest models.OptimiserRequest) models.TimetableState {

	initial := models.TimetableState{
		Assignments: make(map[string]string),
	}
	for d := 0; d < 6; d++ {
		initial.DaySlots[d] = make([]models.ModuleSlot, 0)
	}
	beam := []models.TimetableState{initial}

	for _, lessonKey := range lessons {
		var nextBeam []models.TimetableState
		slotGroups := lessonToSlots[lessonKey]
		limit := min(len(slotGroups), branchingFactor)

		// iterate over all partial timetables in the beam
		for _, state := range beam {

			// iterate over all slot groups for the current lesson
			for i := 0; i < limit; i++ {
				group := slotGroups[i]

				// Filters out invalid slots by checking if
				// DayIndex is not -1 which marks invalid slots when parsing in ParseModuleSlotFields func
				validGroup := make([]models.ModuleSlot, 0, len(group))
				for i := range group {
					slot := &group[i]
					if slot.DayIndex >= 0 && slot.DayIndex < 6 {
						validGroup = append(validGroup, *slot)
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

		// if no valid partial timetables found then skip to next lesson
		// by keeping the beam to create partial timetables
		if len(nextBeam) == 0 {
			continue
		}

		sort.Slice(nextBeam, func(i, j int) bool {
			return scoreTimetableState(
				nextBeam[i],
				recordings,
				optimiserRequest,
			) < scoreTimetableState(
				nextBeam[j],
				recordings,
				optimiserRequest,
			)
		})

		// Prune to beamWidth
		if len(nextBeam) > beamWidth {
			nextBeam = nextBeam[:beamWidth]
		}

		beam = nextBeam
	}

	return beam[0]
}

// insertSlotSorted maintains the time-sorted order of slots in a day by inserting newSlot
// at the correct position based on start time. Uses binary search for O(log n) lookup,
// though insertion itself is O(n) due to slice copying.
// The daySlots must already be sorted by StartMin for this to work correctly.
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

// isLessonRecorded determines if a lesson is marked as recorded/online by the user.
// Recorded lessons don't require physical attendance, so they're excluded from distance
// calculations and free day constraints.
// Converts lessonKey format from "MODULE|LessonType" to "MODULE LessonType" for lookup.
func isLessonRecorded(lessonKey string, recordings map[string]bool) bool {
	// Convert lessonKey from "MODULE|LessonType" to "MODULE LessonType" format
	parts := strings.Split(lessonKey, "|")
	if len(parts) != 2 {
		return false
	}
	return recordings[parts[0]+" "+parts[1]]
}

// calculateDayDistanceScore computes a penalty score based on walking distances between
// consecutive classes in a day. Uses the haversine formula to calculate actual walking
// distance between venue coordinates. Recorded/online lessons and venues without coordinates
// are skipped since they don't require physical travel.
//
// The penalty increases linearly with distance using the formula:
//
//	penalty = (10.0 / MAX_WALK_DISTANCE) * distance_in_km
//
// This encourages timetables with classes in nearby venues.
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
		totalPenalty += (10.0 / constants.MAX_WALK_DISTANCE) * km
	}
	return totalPenalty
}

// hasConflict checks if adding newSlots would create a scheduling conflict with existing
// slots in the timetable state. A conflict occurs when:
//  1. Slots overlap in time (same day, overlapping hours), AND
//  2. Slots occur in the same week (week numbers overlap)
//
// This prevents double-booking where a student would need to attend two classes simultaneously.
// For slots without week information (non-array weeks), assumes conflict if times overlap.
func hasConflict(state models.TimetableState, newSlots []models.ModuleSlot) bool {
	for _, newSlot := range newSlots {
		for _, oldSlot := range state.DaySlots[newSlot.DayIndex] {
			// Check if slots overlap in time
			if newSlot.StartMin < oldSlot.EndMin && oldSlot.StartMin < newSlot.EndMin {

				// if weeks is not a []int, then skip checking for week conflict
				if _, ok := newSlot.Weeks.([]any); !ok {
					return true
				}
				if _, ok := oldSlot.Weeks.([]any); !ok {
					return true
				}

				// check if the weeks overlap
				for _, week := range newSlot.Weeks.([]any) {
					weekInt := int(week.(float64))
					if oldSlot.WeeksSet[weekInt] {
						return true
					}
				}
			}
		}
	}
	return false
}

// copyState creates a deep copy of a timetable state to avoid mutation issues when
// exploring different branches in the beam search. All maps and slices are copied
// to ensure changes to the new state don't affect the original.
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
	for i := 0; i < 6; i++ {
		if len(src.DaySlots[i]) > 0 {
			newState.DaySlots[i] = make([]models.ModuleSlot, len(src.DaySlots[i]))
			copy(newState.DaySlots[i], src.DaySlots[i])
		} else {
			newState.DaySlots[i] = make([]models.ModuleSlot, 0)
		}
	}

	return newState
}

// getPhysicalSlots filters out recorded lessons from a day's schedule, returning
// only lessons that require physical attendance. This is used when evaluating constraints
// that only apply to in-person classes (e.g., lunch breaks, consecutive hours on campus).
func getPhysicalSlots(daySlots []models.ModuleSlot, recordings map[string]bool) []models.ModuleSlot {
	if len(daySlots) == 0 {
		return daySlots
	}

	physicalSlots := make([]models.ModuleSlot, 0, len(daySlots))
	for i := range daySlots {
		slot := &daySlots[i]
		if !isLessonRecorded(slot.LessonKey, recordings) {
			physicalSlots = append(physicalSlots, *slot)
		}
	}

	return physicalSlots
}

// calculateLunchGap finds the largest gap within the user's preferred lunch time window
// that could be used for a lunch break. It checks gaps before the first class, between
// consecutive classes, and after the last class, but only counts time that falls within
// the specified lunch window (lunchStart to lunchEnd).
//
// Returns the best available gap in minutes. If the gap is >= LUNCH_REQUIRED_TIME (60 min),
// the timetable receives a bonus; otherwise it's penalized.
func calculateLunchGap(physicalSlots []models.ModuleSlot, optimiserRequest models.OptimiserRequest) int {
	if len(physicalSlots) == 0 {
		return constants.LUNCH_REQUIRED_TIME
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

// scoreConsecutiveHoursofStudy calculates a penalty for having too many consecutive hours
// of classes without a break. It tracks blocks of back-to-back classes (where one class
// ends exactly when the next begins) and penalizes any block exceeding maxConsecutiveHours.
//
// Algorithm:
//  1. Accumulate duration of consecutive classes (no gap between them)
//  2. When a gap is detected, check if accumulated time exceeds limit and penalize if so
//  3. After the loop, check the final consecutive block
//
// This encourages timetables with breaks between classes to avoid student burnout.
func scoreConsecutiveHoursofStudy(physicalSlots []models.ModuleSlot, maxConsecutiveHours int) int {
	if len(physicalSlots) == 0 {
		return 0
	}

	score := 0
	consecutiveMinutes := 0

	for i := 0; i < len(physicalSlots); i++ {
		currentSlot := physicalSlots[i]
		currentSlotStartMin := currentSlot.StartMin
		currentSlotEndMin := currentSlot.EndMin

		var prevSlotEndMin int
		if i == 0 {
			prevSlotEndMin = currentSlot.StartMin
		} else {
			prevSlotEndMin = physicalSlots[i-1].EndMin
		}

		// Check if current slot is consecutive to previous slot
		if currentSlotStartMin == prevSlotEndMin {
			consecutiveMinutes += currentSlotEndMin - currentSlotStartMin
		} else {
			// Gap detected, score the consecutive hours so far
			score += penaliseConsecutiveHoursofStudy(consecutiveMinutes, maxConsecutiveHours)
			consecutiveMinutes = currentSlotEndMin - currentSlotStartMin
		}

		// If it's the last slot, score the consecutive hours
		if i == len(physicalSlots)-1 {
			score += penaliseConsecutiveHoursofStudy(consecutiveMinutes, maxConsecutiveHours)
		}
	}

	return score
}

// penaliseConsecutiveHoursofStudy returns a penalty score for a block of consecutive class time.
// Returns 0 if within the allowed maximum, otherwise returns a penalty proportional to
// how many hours over the limit (excess_hours * CONSECUTIVE_HOURS_PENALTY_RATE).
func penaliseConsecutiveHoursofStudy(consecutiveMinutes int, maxConsecutiveHours int) int {
	consecutiveHours := consecutiveMinutes / 60
	if consecutiveHours <= maxConsecutiveHours {
		return 0
	}
	return (consecutiveHours - maxConsecutiveHours) * constants.CONSECUTIVE_HOURS_PENALTY_RATE
}

// scoreTimetableState assigns a heuristic score to a timetable state to determine its quality.
// Lower scores indicate better (more preferred) timetables.
//
// The scoring function combines multiple factors:
//   - Lunch break availability: Bonus if >= 60min gap in lunch window, penalty otherwise
//   - Large gaps between classes: Penalizes gaps > 2 hours to avoid excessive downtime
//   - Consecutive hours: Penalizes too many back-to-back classes without breaks
//   - Walking distance: Accumulated distance penalties between physical lesson venues from all days
func scoreTimetableState(
	state models.TimetableState,
	recordings map[string]bool,
	optimiserRequest models.OptimiserRequest,
) float64 {
	var totalScore float64
	for d := 0; d < 6; d++ {
		if len(state.DaySlots[d]) == 0 {
			continue
		}

		physicalSlots := getPhysicalSlots(state.DaySlots[d], recordings)

		// Apply lunch penalty/bonus
		lunchGap := calculateLunchGap(physicalSlots, optimiserRequest)
		if lunchGap >= constants.LUNCH_REQUIRED_TIME {
			totalScore += constants.LUNCH_BONUS
		} else {
			totalScore += constants.NO_LUNCH_PENALTY
		}

		// Apply gap penalty for large gaps of > 2 hours between classes
		largestGap := calculateLargestGap(physicalSlots)
		if largestGap > constants.GAP_PENALTY_THRESHOLD {
			totalScore += constants.GAP_PENALTY_RATE * float64(largestGap-constants.GAP_PENALTY_THRESHOLD) / 60
		}

		// Apply penalty for more than max consecutive hours of study
		totalScore += float64(scoreConsecutiveHoursofStudy(physicalSlots, optimiserRequest.MaxConsecutiveHours))
	}

	// Add penalty for walking distance
	return totalScore + state.TotalDistance
}

// calculateLargestGap finds the largest time gap (in minutes) between consecutive classes
// in a day. Used to penalize timetables with excessively long breaks (> 2 hours) that
// result in wasted time.
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
	DefaultShareableLink string `json:"defaultShareableLink"`
}

// Solve is the main HTTP handler that orchestrates the timetable optimization process.
// It fetches module data, prepares the search space, runs beam search, generates a
// shareable NUSMods link, and returns the optimized timetable as JSON.
//
// The function applies the Minimum Remaining Values (MRV) heuristic by sorting lessons
// with fewer class options first, which helps reduce the search space early.
func Solve(w http.ResponseWriter, req models.OptimiserRequest) {
	slots, defaultSlots, err := modules.GetAllModuleSlots(req)
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
	shareableLink, defaultShareableLink := GenerateNUSModsShareableLink(best.Assignments, defaultSlots, lessonToSlots, req)
	response := SolveResponse{
		TimetableState: best,
		ShareableLink:  shareableLink,
		DefaultShareableLink: defaultShareableLink,
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
