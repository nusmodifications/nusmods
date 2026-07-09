// HTTP Client to make requests to NUSMODS apis
package client

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	constants "github.com/nusmodifications/nusmods/website/api/optimiser/_constants"
)

var httpClient = &http.Client{Timeout: constants.HTTPRequestTimeout}

// badStatusError signals a non-200 response. It carries the status code so the
// retry logic can decide whether the failure is worth retrying (5xx) or is a
// permanent client error such as an unknown module (4xx).
type badStatusError struct {
	module     string
	statusCode int
}

func (e *badStatusError) Error() string {
	return fmt.Sprintf("failed to fetch module %s: status %d", e.module, e.statusCode)
}

// GetModuleData fetches a module's JSON data, retrying transient failures.
//
// Network errors and timeouts (the origin being briefly slow to respond) and
// 5xx responses are retried with a fixed backoff. A 4xx response is treated as
// permanent (e.g. an unknown module returns 404) and is not retried.
func GetModuleData(acadYear string, module string) ([]byte, error) {
	var lastErr error
	for attempt := 1; attempt <= constants.HTTPMaxAttempts; attempt++ {
		body, err := fetchModuleData(acadYear, module)
		if err == nil {
			return body, nil
		}
		lastErr = err

		// Don't retry permanent client errors (4xx) — retrying won't help.
		var statusErr *badStatusError
		if errors.As(err, &statusErr) &&
			statusErr.statusCode >= http.StatusBadRequest &&
			statusErr.statusCode < http.StatusInternalServerError {
			return nil, err
		}

		// Don't sleep after the final attempt.
		if attempt < constants.HTTPMaxAttempts {
			time.Sleep(constants.HTTPRetryBackoff)
		}
	}
	return nil, fmt.Errorf("giving up after %d attempts: %w", constants.HTTPMaxAttempts, lastErr)
}

// fetchModuleData performs a single HTTP request for a module's JSON data.
func fetchModuleData(acadYear string, module string) ([]byte, error) {
	url := fmt.Sprintf(constants.ModulesURL, acadYear, module)
	res, err := httpClient.Get(url)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, &badStatusError{module: module, statusCode: res.StatusCode}
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	return body, nil
}
