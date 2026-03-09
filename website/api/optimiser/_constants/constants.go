package constants

import (
	_ "embed"
)

// Ensure in sync with all E-Venues in NUSMods
var EVenues = map[string]bool{
	"E-Learn_A":  true,
	"E-Learn_B":  true,
	"E-Learn_C":  true,
	"E-Learn_D":  true,
	"E-Hybrid_A": true,
	"E-Hybrid_B": true,
	"E-Hybrid_C": true,
	"E-Hybrid_D": true,
}

// Ensure this is in sync with website/src/utils/timtetables.ts
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

const (
	MaxWalkDistance            = 0.250 // 250 meters
	NoVenuePenalty             = 100.0
	LunchBonus                 = -300.0
	NoLunchPenalty             = 300.0
	GapPenaltyThreshold        = 120 // 2 hours in minutes
	GapPenaltyRate             = 100.0
	LunchRequiredTime          = 60 // 1 hour in minutes
	ConsecutiveHoursPenaltyRate = 100
)

// This is used by [nusmods_link.SerializeLessonIndices] to serialize the result of optimiser into a timetable share link to return to the client
const ModuleCodeSeparator = ";"
