package solver

import (
	"fmt"
	"strings"

	constants "github.com/nusmodifications/nusmods/website/api/optimiser/_constants"
	models "github.com/nusmodifications/nusmods/website/api/optimiser/_models"
)

// Parses the assignments into a map of module codes to lesson types to class numbers
func CreateConfig(assignments map[string]string) map[string]map[string]string {
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
func SerializeConfig(config map[string]map[string]string) string {
	var moduleParams []string

	for moduleCode, lessons := range config {
		var lessonParams []string
		for lessonType, classNo := range lessons {
			// Get abbreviation for lesson type
			abbrev := constants.LessonTypeAbbrev[strings.ToUpper(lessonType)]

			lessonParams = append(lessonParams, fmt.Sprintf("%s:%s", abbrev, classNo))
		}
		if len(lessonParams) > 0 {
			moduleParams = append(moduleParams, fmt.Sprintf("%s=%s", moduleCode, strings.Join(lessonParams, ",")))
		}
	}

	return strings.Join(moduleParams, "&")
}

// GenerateNUSModsShareableLink creates a shareable NUSMods link from the assignments
func GenerateNUSModsShareableLink(assignments map[string]string, defaultSlots map[string]map[string][]models.ModuleSlot, req models.OptimiserRequest) string {
	/*
		- Initialize assignments for skipped slots with default slots
	*/
	for moduleCode, slots := range defaultSlots {
		for lessonType, slots := range slots {
			lessonKey := strings.ToUpper(moduleCode) + "|" + lessonType
			if assignments[lessonKey] == "" {
				classNo := slots[0].ClassNo
				assignments[lessonKey] = classNo
			}
		}

	}

	config := CreateConfig(assignments)
	serializedConfig := SerializeConfig(config)

	semesterPath := ""
	switch req.AcadSem {
	case 1:
		semesterPath = "sem-1"
	case 2:
		semesterPath = "sem-2"
	case 3:
		semesterPath = "st-i"
	case 4:
		semesterPath = "st-ii"
	default:
		semesterPath = "sem-1"
	}

	// Construct final URL
	shareableURL := fmt.Sprintf("%s/%s/share?%s", constants.NUSModsTimetableBaseURL, semesterPath, serializedConfig)

	return shareableURL
}
