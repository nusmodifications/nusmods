package client

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	constants "github.com/nusmodifications/nusmods/website/api/optimiser/_constants"
	models "github.com/nusmodifications/nusmods/website/api/optimiser/_models"
)

func GetVenues() (map[string]models.Location, error) {
	venues := make(map[string]models.Location)
	err := json.Unmarshal(constants.VenuesJson, &venues)
	if err != nil {
		log.Printf("unable to load venues.json: %v", err)
		return nil, err
	}

	return venues, nil
}

func GetModuleData(acadYear string, module string) ([]byte, error) {
	url := fmt.Sprintf(constants.ModulesURL, acadYear, module)
	res, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	return body, nil
}
