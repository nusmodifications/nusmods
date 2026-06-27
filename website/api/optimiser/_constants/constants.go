package constants

import (
	_ "embed"

	models "github.com/nusmodifications/nusmods/website/api/optimiser/_models"
)

// EVenues lists all virtual venue identifiers. Keep in sync with all E-Venues in NUSMods.
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

// LessonTypeAbbrev maps full lesson type names to their abbreviations. Keep in sync with website/src/utils/timetables.ts.
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
var VenuesJSON []byte

const ModulesURL = "https://api.nusmods.com/v2/%s/modules/%s.json"

const NUSModsTimetableBaseURL = "https://nusmods.com/timetable"

// Heuristics for scoring function.
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

// ModuleCodeSeparator is used by [nusmods_link.SerializeLessonIndices] to serialize the optimiser result into a timetable share link.
const ModuleCodeSeparator = ";"

// Beam search parameters.
const (
	BeamWidth       = 5000
	BranchingFactor = 100
	DaysPerWeek     = 6
)

// InvalidCoordinates indicates that a venue coordinate is invalid.
var InvalidCoordinates = models.Coordinates{X: -1, Y: -1}
