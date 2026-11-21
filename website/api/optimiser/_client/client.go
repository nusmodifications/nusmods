// HTTP Client to make requests to NUSMODS apis
package client

import (
	"fmt"
	"io"
	"net/http"
	"time"

	constants "github.com/nusmodifications/nusmods/website/api/optimiser/_constants"
)

const (
	// maxRetries is the number of retries after the first attempt.
	maxRetries = 5
	// baseRetryDelay doubles on each retry: 0.3s, 0.6s, 1.2s, 2.4s, 4.8s (9.3s in total).
	baseRetryDelay = 300 * time.Millisecond
)

var httpClient = &http.Client{Timeout: 10 * time.Second}

// GetModuleData fetches a module's data, retrying transient failures with exponential backoff.
func GetModuleData(acadYear string, module string) ([]byte, error) {
	url := fmt.Sprintf(constants.ModulesURL, acadYear, module)
	body, err := getWithRetry(url, baseRetryDelay)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch module %s: %w", module, err)
	}
	return body, nil
}

// getWithRetry GETs url, retrying network errors, 429 and 5xx responses up to maxRetries times.
// The wait before retry n is baseDelay * 2^(n-1).
func getWithRetry(url string, baseDelay time.Duration) ([]byte, error) {
	var lastErr error
	for attempt := 0; attempt <= maxRetries; attempt++ {
		if attempt > 0 {
			time.Sleep(baseDelay << (attempt - 1))
		}

		res, err := httpClient.Get(url)
		if err != nil {
			lastErr = err
			continue
		}

		if res.StatusCode == http.StatusOK {
			body, err := io.ReadAll(res.Body)
			_ = res.Body.Close()
			if err == nil {
				return body, nil
			}
			lastErr = err
			continue
		}

		// Drain the body so the connection can be reused.
		_, _ = io.Copy(io.Discard, res.Body)
		_ = res.Body.Close()
		lastErr = fmt.Errorf("status %d", res.StatusCode)
		if res.StatusCode != http.StatusTooManyRequests && res.StatusCode < http.StatusInternalServerError {
			return nil, lastErr
		}
	}
	return nil, fmt.Errorf("gave up after retrying: %w", lastErr)
}
