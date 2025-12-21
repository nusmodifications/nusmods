/*
Package handler provides the HTTP handler for the NUSMods timetable optimiser API.
This package serves as the serverless function entry point for Vercel deployments
and handles incoming optimization requests from the NUSMods web application.
*/
package handler

import (
	"encoding/json"
	"net/http"

	models "github.com/nusmodifications/nusmods/website/api/optimiser/_models"
	solver "github.com/nusmodifications/nusmods/website/api/optimiser/_solver"
)

/*
Handler is the main entry point for the timetable optimiser API endpoint.
It accepts POST requests with module selection and preferences, runs the optimization
algorithm, and returns the best timetable as JSON.

The handler:
  - Enables CORS to allow requests from the NUSMods frontend
  - Validates that only POST requests are accepted (OPTIONS for CORS preflight)
  - Parses the JSON request body into an OptimiserRequest
  - Delegates to the solver to compute the optimal timetable

Expected request body: JSON with modules, preferences, constraints
Response: JSON with optimal timetable assignments, schedule, and shareable link.
*/
func Handler(w http.ResponseWriter, r *http.Request) {
	// Allow CORS from all origins
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// only allow POST requests
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// get selected modules from request
	var optimiserRequest models.OptimiserRequest
	err := json.NewDecoder(r.Body).Decode(&optimiserRequest)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	solver.Solve(w, optimiserRequest)
}
