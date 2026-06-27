// Package client makes HTTP requests to the NUSMods API.
package client

import (
	"fmt"
	"io"
	"net/http"
	"time"

	constants "github.com/nusmodifications/nusmods/website/api/optimiser/_constants"
)

var httpClient = &http.Client{Timeout: 10 * time.Second}

// GetModuleData fetches timetable data for a module from the NUSMods API.
func GetModuleData(acadYear string, module string) ([]byte, error) {
	url := fmt.Sprintf(constants.ModulesURL, acadYear, module)
	res, err := httpClient.Get(url) //nolint:noctx // httpClient has a timeout set
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch module %s: status %d", module, res.StatusCode)
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	return body, nil
}
