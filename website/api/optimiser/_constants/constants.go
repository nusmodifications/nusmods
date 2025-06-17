package constants

var AllowedOrigins = []string{
	"nusmods.com",
	"vercel.app",
}

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

var LessonTypeAbbrev = map[string]string{
	"DESIGN LECTURE":                "DLEC",
	"LABORATORY":                    "LAB",
	"LECTURE":                       "LEC",
	"PACKAGED LECTURE":              "PLEC",
	"PACKAGED TUTORIAL":             "PTUT",
	"RECITATION":                    "REC",
	"SECTIONAL TEACHING":            "SEC",
	"SEMINAR-STYLE MODULE TEACHING": "SEM",
	"TUTORIAL":                      "TUT",
	"TUTORIAL TYPE 2":               "TUT2",
	"TUTORIAL TYPE 3":               "TUT3",
	"WORKSHOP":                      "WS",
}

var VenuesURL = "https://github.nusmods.com/venues"

var ModulesURL = "https://api.nusmods.com/v2/%s/modules/%s.json"

var NUSModsTimetableBaseURL = "https://nusmods.com/timetable"
