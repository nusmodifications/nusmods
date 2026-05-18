package models

import (
	"fmt"
	"strconv"
	"strings"
)

type LessonType = string
type ClassNo = string
type LessonIndex = int

// ModuleTimetableMap organises module slots by Module -> LessonType -> ClassNo -> []ModuleSlot
type ModuleTimetableMap = map[string]map[LessonType]map[ClassNo][]ModuleSlot

// ModuleDefaultSlotsMap organises default/backup slots by Module -> LessonType -> []ModuleSlot
type ModuleDefaultSlotsMap = map[string]map[LessonType][]ModuleSlot

type OptimiserRequest struct {
	Modules             []string `json:"modules"`             // Format: ["CS1010S", "CS2030S"]
	Recordings          []string `json:"recordings"`          // Format: ["CS1010S|Lecture", "CS2030S|Laboratory"]
	FreeDays            []string `json:"freeDays"`            // Format: ["Monday", "Tuesday"]
	EarliestTime        string   `json:"earliestTime"`        // Format: "1504" (HHMM)
	LatestTime          string   `json:"latestTime"`          // Format: "1504" (HHMM)
	AcadYear            string   `json:"acadYear"`            // Format: "2024-2025" (YYYY-YYYY)
	AcadSem             int      `json:"acadSem"`             // Format: 1 for sem 1, 2 for sem 2
	MaxConsecutiveHours int      `json:"maxConsecutiveHours"` // Maximum consecutive hours of study
	LunchStart          string   `json:"lunchStart"`          // Format: "1504" (HHMM)
	LunchEnd            string   `json:"lunchEnd"`            // Format: "1500" (HHMM)

	// Parsed fields
	EarliestMin   int `json:"-"`
	LatestMin     int `json:"-"`
	LunchStartMin int `json:"-"`
	LunchEndMin   int `json:"-"`
}

// ParseOptimiserRequestFields validates and parses time fields into minutes.
func (r *OptimiserRequest) ParseOptimiserRequestFields() error {
	if len(r.Modules) == 0 {
		return fmt.Errorf("at least one module must be provided")
	}
	var err error
	r.EarliestMin, err = ParseTimeToMinutes(r.EarliestTime)
	if err != nil {
		return fmt.Errorf("invalid earliestTime: %s", r.EarliestTime)
	}
	r.LatestMin, err = ParseTimeToMinutes(r.LatestTime)
	if err != nil {
		return fmt.Errorf("invalid latestTime: %s", r.LatestTime)
	}
	r.LunchStartMin, err = ParseTimeToMinutes(r.LunchStart)
	if err != nil {
		return fmt.Errorf("invalid lunchStart: %s", r.LunchStart)
	}
	r.LunchEndMin, err = ParseTimeToMinutes(r.LunchEnd)
	if err != nil {
		return fmt.Errorf("invalid lunchEnd: %s", r.LunchEnd)
	}

	// TODO: Time range validation for earliest time, latest time, lunch start time, lunch end time
	// Ensure earlier time <= later time. Currently not ensured in frontend yet. Once that is completed
	// we can add this check for completion.
	return nil
}

// SolveError is returned by Solve to communicate both the error message and the
// appropriate HTTP status code to the handler
type SolveError struct {
	Code    int
	Message string
}

func (e *SolveError) Error() string { return e.Message }

type SolveResponse struct {
	TimetableState
	ShareableLink        string `json:"shareableLink"`
	DefaultShareableLink string `json:"defaultShareableLink"`
}

type TimetableState struct {
	Assignments   map[string]string `json:"Assignments"`   // lessonKey -> chosen classNo
	DaySlots      [6][]ModuleSlot   `json:"DaySlots"`      // For each day, a time-sorted slice of slots
	DayDistance   [6]float64        `json:"DayDistance"`   // Per-day walking penalty score (sum of haversine distances between consecutive physical lessons)
	TotalDistance float64           `json:"TotalDistance"` // Sum of all DayDistance

	// Calculated fields
	Score float64 `json:"Score"`
}

type ModuleSlot struct {
	ClassNo     ClassNo     `json:"classNo"`
	Day         string      `json:"day"`
	EndTime     string      `json:"endTime"`
	LessonType  string      `json:"lessonType"`
	StartTime   string      `json:"startTime"`
	Venue       string      `json:"venue"`
	Coordinates Coordinates `json:"coordinates"`
	Weeks       any         `json:"weeks"`

	// Parsed fields
	StartMin    int              `json:"StartMin"`  // Minutes from 00:00 (e.g., 540 for 09:00)
	EndMin      int              `json:"EndMin"`    // Minutes from 00:00
	DayIndex    int              `json:"DayIndex"`  // 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday
	LessonKey   string           `json:"LessonKey"` // "MODULE|LessonType"
	WeeksSet    map[int]struct{} `json:"WeeksSet"`
	WeeksString string           `json:"WeeksString"`
	LessonIndex LessonIndex      `json:"LessonIndex"`
}

// ParseModuleSlotFields parses and populates the parsed fields in ModuleSlot for faster computation
func (slot *ModuleSlot) ParseModuleSlotFields(lessonKey string) error {
	startMin, err1 := ParseTimeToMinutes(slot.StartTime)
	endMin, err2 := ParseTimeToMinutes(slot.EndTime)
	if err1 != nil || err2 != nil {
		return fmt.Errorf("invalid slot times for %s: start=%s, end=%s",
			lessonKey, slot.StartTime, slot.EndTime)
	}
	dayIdx, exists := dayToIndex[strings.ToUpper(slot.Day)]
	if !exists {
		return fmt.Errorf("invalid day for %s: %s", lessonKey, slot.Day)
	}

	slot.StartMin = startMin
	slot.EndMin = endMin
	slot.DayIndex = dayIdx
	slot.LessonKey = lessonKey

	return nil
}

type Coordinates struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type Location struct {
	Location Coordinates `json:"location"`
}

// dayToIndex maps uppercase weekday names to indices 0..5.
var dayToIndex = map[string]int{
	"MONDAY":    0,
	"TUESDAY":   1,
	"WEDNESDAY": 2,
	"THURSDAY":  3,
	"FRIDAY":    4,
	"SATURDAY":  5,
}

// Helper Functions

// ParseTimeToMinutes converts "HHMM" to minutes since midnight, with error checking.
func ParseTimeToMinutes(timeStr string) (int, error) {
	if len(timeStr) != 4 {
		return 0, fmt.Errorf("invalid time format: %s", timeStr)
	}
	hour, err1 := strconv.Atoi(timeStr[:2])
	min, err2 := strconv.Atoi(timeStr[2:])
	if err1 != nil || err2 != nil {
		return 0, fmt.Errorf("invalid time format: %s", timeStr)
	}
	if hour < 0 || hour > 23 || min < 0 || min > 59 {
		return 0, fmt.Errorf("time out of range: %s", timeStr)
	}
	return hour*60 + min, nil
}
