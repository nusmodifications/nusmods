package solver

import (
	"net/http"
    "encoding/json"
	"github.com/nusmodifications/nusmods/optimiser/lib/models"
	"github.com/nusmodifications/nusmods/optimiser/lib/modules"
)

func Solve(w http.ResponseWriter, optimiserRequest models.OptimiserRequest) {
	moduleSlots, err := modules.GetAllModuleSlots(optimiserRequest)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	json.NewEncoder(w).Encode(moduleSlots)
}