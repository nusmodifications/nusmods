package constants

import (
	_ "embed"
	"time"

	models "github.com/nusmodifications/nusmods/website/api/optimiser/_models"
)

// HTTP client settings for fetching module data from the NUSMods API.
const (
	// HTTPRequestTimeout bounds a single request (connect + awaiting headers +
	// reading the body), applied per attempt rather than across all retries.
	// Observed failures are connection/transit stalls on the way to the origin
	// (the origin itself serves in milliseconds), not slow origin compute, so
	// this is kept short to fail fast and let a retry try a fresh connection
	// instead of blocking the whole budget on one stalled attempt.
	HTTPRequestTimeout = 4 * time.Second
	// HTTPMaxAttempts is the total number of attempts (1 initial + retries) for
	// a single module before giving up.
	HTTPMaxAttempts = 3
	// HTTPRetryBackoff is the fixed delay between attempts.
	HTTPRetryBackoff = 300 * time.Millisecond
)

// Ensure in sync with all E-Venues in NUSMods
var EVenues = map[string]struct{}{
	"E-Learn_A":  {},
	"E-Learn_B":  {},
	"E-Learn_C":  {},
	"E-Learn_D":  {},
	"E-Hybrid_A": {},
	"E-Hybrid_B": {},
	"E-Hybrid_C": {},
	"E-Hybrid_D": {},
}

// Ensure this is in sync with website/src/utils/timetables.ts
var LessonTypeAbbrev = map[string]string{
	"DESIGN LECTURE":             "DLEC",
	"LABORATORY":                 "LAB",
	"LECTURE":                    "LEC",
	"PACKAGED LECTURE":           "PLEC",
	"PACKAGED TUTORIAL":          "PTUT",
	"RECITATION":                 "REC",
	"SECTIONAL TEACHING":         "SEC",
	"SEMINAR-STYLE MODULE CLASS": "SEM",
	"TUTORIAL":                   "TUT",
	"TUTORIAL TYPE 2":            "TUT2",
	"TUTORIAL TYPE 3":            "TUT3",
	"WORKSHOP":                   "WS",
}

//go:embed venues.json
var VenuesJson []byte

const ModulesURL = "https://api.nusmods.com/v2/%s/modules/%s.json"

const NUSModsTimetableBaseURL = "https://nusmods.com/timetable"

// Heuristics for scoring function
const (
	MaxWalkDistance             = 0.250 // 250 meters
	NoVenuePenalty              = 100.0
	LunchBonus                  = -300.0
	NoLunchPenalty              = 300.0
	GapPenaltyThreshold         = 120 // 2 hours in minutes
	GapPenaltyRate              = 100.0
	LunchRequiredTime           = 60 // 1 hour in minutes
	ConsecutiveHoursPenaltyRate = 100
)

const LessonParamsSeparator = ","

// Beam search parameters
const (
	BeamWidth       = 5000
	BranchingFactor = 100
	DaysPerWeek     = 6
)

// Indicates that a Coordinate was invalid
var InvalidCoordinates = models.Coordinates{X: -1, Y: -1}
