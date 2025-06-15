package solver

import (
	"fmt"
	"strings"

	"github.com/nusmodifications/nusmods/website/api/optimiser/optimise/models"
)

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

// Parses the assignments into a map of module codes to lesson types to class numbers
func ConvertAssignmentsToNUSModsConfig(assignments map[string]string) map[string]map[string]string {
	config := make(map[string]map[string]string)

	for lessonKey, classNo := range assignments {
		// Parse lesson key: "MODULE|LESSONTYPE"
		parts := strings.Split(lessonKey, "|")
		if len(parts) != 2 {
			continue
		}
		moduleCode := parts[0]
		lessonType := parts[1]

		// Initialize module config if not exists
		if config[moduleCode] == nil {
			config[moduleCode] = make(map[string]string)
		}

		// Add lesson type and class number to config
		config[moduleCode][lessonType] = classNo
	}

	return config
}

// Constructs the URL
func SerializeNUSModsConfig(config map[string]map[string]string) string {
	var moduleParams []string

	for moduleCode, lessons := range config {
		var lessonParams []string
		for lessonType, classNo := range lessons {
			// Get abbreviation for lesson type
			abbrev := LessonTypeAbbrev[strings.ToUpper(lessonType)]

			lessonParams = append(lessonParams, fmt.Sprintf("%s:%s", abbrev, classNo))
		}
		if len(lessonParams) > 0 {
			moduleParams = append(moduleParams, fmt.Sprintf("%s=%s", moduleCode, strings.Join(lessonParams, ",")))
		}
	}

	return strings.Join(moduleParams, "&")
}

// GenerateNUSModsShareableLinkFromAssignments creates a shareable NUSMods link from the assignments
func GenerateNUSModsShareableLinkFromAssignments(assignments map[string]string, req models.OptimiserRequest) string {
	config := ConvertAssignmentsToNUSModsConfig(assignments)
	serializedConfig := SerializeNUSModsConfig(config)
	baseURL := "https://nusmods.com/timetable"
	semesterPath := ""
	switch req.AcadSem {
	case 1:
		semesterPath = "sem-1"
	case 2:
		semesterPath = "sem-2"
	default:
		semesterPath = "sem-1"
	}

	// Construct final URL
	shareableURL := fmt.Sprintf("%s/%s/share?%s", baseURL, semesterPath, serializedConfig)

	return shareableURL
}
