// HTTP Client to make requests to NUSMODS apis
package client

import (
	"fmt"
	"io"
	"net/http"
	"time"

	constants "github.com/nusmodifications/nusmods/website/api/optimiser/_constants"
)

var httpClient = &http.Client{Timeout: 10 * time.Second}

// HTTP request to get Module data
func GetModuleData(acadYear string, module string) ([]byte, error) {
	url := fmt.Sprintf(constants.ModulesURL, acadYear, module)
	res, err := httpClient.Get(url)
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
