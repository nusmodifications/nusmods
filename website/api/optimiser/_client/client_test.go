package client

import (
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
	"time"
)

const testDelay = time.Millisecond

func newServer(t *testing.T, statuses ...int) (*httptest.Server, *atomic.Int32) {
	t.Helper()
	var calls atomic.Int32
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		n := int(calls.Add(1)) - 1
		status := statuses[min(n, len(statuses)-1)]
		w.WriteHeader(status)
		if status == http.StatusOK {
			_, _ = w.Write([]byte("ok"))
		}
	}))
	t.Cleanup(server.Close)
	return server, &calls
}

func TestGetWithRetrySucceedsAfterTransientFailures(t *testing.T) {
	server, calls := newServer(t, http.StatusInternalServerError, http.StatusTooManyRequests, http.StatusOK)

	body, err := getWithRetry(server.URL, testDelay)
	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}
	if string(body) != "ok" {
		t.Errorf("expected body %q, got %q", "ok", body)
	}
	if calls.Load() != 3 {
		t.Errorf("expected 3 attempts, got %d", calls.Load())
	}
}

func TestGetWithRetryDoesNotRetryClientErrors(t *testing.T) {
	server, calls := newServer(t, http.StatusNotFound)

	if _, err := getWithRetry(server.URL, testDelay); err == nil {
		t.Fatal("expected an error for 404")
	}
	if calls.Load() != 1 {
		t.Errorf("expected 1 attempt, got %d", calls.Load())
	}
}

func TestGetWithRetryGivesUpAfterMaxRetries(t *testing.T) {
	server, calls := newServer(t, http.StatusBadGateway)

	if _, err := getWithRetry(server.URL, testDelay); err == nil {
		t.Fatal("expected an error after persistent 502s")
	}
	if calls.Load() != maxRetries+1 {
		t.Errorf("expected %d attempts, got %d", maxRetries+1, calls.Load())
	}
}

func TestRetryScheduleWaitsAtMostTenSeconds(t *testing.T) {
	var total time.Duration
	for retry := 1; retry <= maxRetries; retry++ {
		total += baseRetryDelay << (retry - 1)
	}
	if total > 10*time.Second {
		t.Errorf("total backoff %v exceeds 10s", total)
	}
}
