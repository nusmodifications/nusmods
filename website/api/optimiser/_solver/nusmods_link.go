package solver

import (
	"fmt"
	"strings"

	constants "github.com/nusmodifications/nusmods/website/api/optimiser/_constants"
	models "github.com/nusmodifications/nusmods/website/api/optimiser/_models"
)

// Parses the assignments into a map of module codes to lesson types to class numbers
func CreateConfig(assignments map[string]string, lessonToSlots map[string][][]models.ModuleSlot) map[string]map[string][]models.LessonIndex {
	config := make(map[string]map[string][]models.LessonIndex)

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
			config[moduleCode] = make(map[string][]models.LessonIndex)
		}

		// Add lesson type and class number to config
		for _, lessonsWithClassNo := range lessonToSlots[lessonKey] {
			if lessonsWithClassNo[0].ClassNo != classNo {
				continue
			}

			for _, lesson := range lessonsWithClassNo {
				config[moduleCode][lessonType] = append(config[moduleCode][lessonType], lesson.LessonIndex)
			}
			break
		}
	}

	return config
}

// Constructs the URL
func SerializeConfig(config map[string]map[string][]models.LessonIndex) string {
	var moduleParams []string

	for moduleCode, lessons := range config {
		var lessonParams []string
		for lessonType, lessonIndex := range lessons {
			// Get abbreviation for lesson type
			abbrev := constants.LessonTypeAbbrev[strings.ToUpper(lessonType)]

			lessonParams = append(lessonParams, fmt.Sprintf("%s:%s", abbrev, "("+strings.Trim(strings.Join(strings.Fields(fmt.Sprint(lessonIndex)), ","), "[]"))+")")
		}
		if len(lessonParams) > 0 {
			moduleParams = append(moduleParams, fmt.Sprintf("%s=%s", moduleCode, strings.Join(lessonParams, ";")))
		}
	}

	return strings.Join(moduleParams, "&")
}

// GenerateNUSModsShareableLink creates a shareable NUSMods link from the assignments
func GenerateNUSModsShareableLink(assignments map[string]string, lessonToSlots map[string][][]models.ModuleSlot, req models.OptimiserRequest) string {
	config := CreateConfig(assignments, lessonToSlots)
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
