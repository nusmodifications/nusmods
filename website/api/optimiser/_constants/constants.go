package constants

import "path/filepath"

// Ensure in sync with all E-Venues in NUSMods
var E_Venues = map[string]bool{
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

var VenuesPath = filepath.Join("src", "data", "venues.json")

// Toggle for local testing
// var VenuesPath = "../../../src/data/venues.json"

var ModulesURL = "https://api.nusmods.com/v2/%s/modules/%s.json"

var NUSModsTimetableBaseURL = "https://nusmods.com/timetable"

var MAX_WALK_DISTANCE = 0.250 // 250 meters
var LUNCH_BONUS = -300.0
var NO_LUNCH_PENALTY = 300.0
var GAP_PENALTY_THRESHOLD = 120 // 2 hours in minutes
var GAP_PENALTY_RATE = 100.0
var LUNCH_REQUIRED_TIME = 60 // 1 hour in minutes
var CONSECUTIVE_HOURS_PENALTY_RATE = 100
