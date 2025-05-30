package handler 

import (
	_ "embed"
	"net/http"
	"encoding/json"
	"github.com/nusmodifications/nusmods/optimiser/lib/models"
	"github.com/nusmodifications/nusmods/optimiser/lib/solver"
)

//go:embed venuesMerged.json
var venuesMerged []byte

// Entry point for the API
func Handler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	venues := make(map[string][]float64)
	err := json.Unmarshal(venuesMerged, &venues)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// get selected modules from request
	var optimiserRequest models.OptimiserRequest
	err = json.NewDecoder(r.Body).Decode(&optimiserRequest)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	solver.Solve(w, optimiserRequest)

}