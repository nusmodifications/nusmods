package client

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"

	constants "github.com/nusmodifications/nusmods/website/api/optimiser/_constants"
	models "github.com/nusmodifications/nusmods/website/api/optimiser/_models"
)

func GetVenues() (map[string]models.Location, error) {
	cwd, err := os.Getwd()
	if err != nil {
		log.Printf("failed to get working directory: %v", err)
		return nil, err
	}

	path := filepath.Join(cwd, constants.VenuesPath)
	file, err := os.Open(path)
	if err != nil {
		log.Printf("unable to load venues.json: %v", err)
		return nil, err
	}
	defer file.Close()

	body, err := io.ReadAll(file)
	if err != nil {
		log.Printf("unable to read venues.json %v", err)
		return nil, err
	}

	venues := make(map[string]models.Location)
	err = json.Unmarshal(body, &venues)
	if err != nil {
		log.Printf("unable to parse venues.json %v", err)
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
