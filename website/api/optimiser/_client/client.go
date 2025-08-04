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

	log.Printf("cwd: %s", cwd)

	if _, err := os.Stat(filepath.Join(cwd, "src")); err == nil {
		log.Println("src directory exists")
		srcEntries, _ := os.ReadDir(filepath.Join(cwd, "src"))
		for _, e := range srcEntries {
			log.Printf("- src/%s", e.Name())
		}
	} else {
		log.Println("src directory does not exist")
	}

	if _, err := os.Stat(filepath.Join("src")); err == nil {
		log.Println("/src directory exists")
		srcEntries, _ := os.ReadDir(filepath.Join("src"))
		for _, e := range srcEntries {
			log.Printf("- src/%s", e.Name())
		}
	} else {
		log.Println("/src directory does not exist")
	}

	path := filepath.Join(cwd, constants.VenuesPath)
	file, err := os.Open(path)
	if err != nil {
		log.Printf("unable to load venues.json: %v", err)

		entries, err := os.ReadDir(cwd)
		if err != nil {
			log.Printf("unable to os.ReadDir: %v", err)
			return nil, err
		}
		for _, e := range entries {
			log.Printf("entry: %s", e.Name())
		}
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
