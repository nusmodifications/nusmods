package models

type OptimiserRequest struct {
	Modules 	[]string `json:"modules"` // Format: ["CS1010S", "CS2030S"]
	Recordings 	[]string `json:"recordings"` // Format: ["CS1010S", "CS2030S"]
	FreeDays 	[]string `json:"freeDays"` // Format: ["Monday", "Tuesday"]
	EarliestTime string  `json:"earliestTime"` // Format: "1504" (HHMM)
	LatestTime   string  `json:"latestTime"` // Format: "1504" (HHMM)
	AcadYear     string  `json:"acadYear"` // Format: "2024/2025" (YYYY/YYYY)
	AcadSem      int     `json:"acadSem"` // Format: 1 for sem 1, 2 for sem 2
}

