/*
Package handler provides the HTTP handler for the NUSMods timetable optimiser API.
This package serves as the serverless function entry point for Vercel deployments
and handles incoming optimization requests from the NUSMods web application.
*/
package handler

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"os"
	"time"

	models "github.com/nusmodifications/nusmods/website/api/optimiser/_models"
	solver "github.com/nusmodifications/nusmods/website/api/optimiser/_solver"
)

// logger emits JSON logs tagged with a "service" field. Vercel automatically
// parses JSON log lines from serverless functions, so each line carries a
// timestamp, level, message and service name — giving us searchable, filterable
// logs on the dashboard for debugging requests.
//
//nolint:gochecknoglobals // a single package-level logger shared by the handler
var logger = slog.New(
	slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}),
).With("service", "optimiser")

// Handler is the main entry point for the timetable optimiser API endpoint.
// It accepts POST requests with module selection and preferences, runs the optimization
// algorithm, and returns the best timetable as JSON.
//
// The handler:
//   - Enables CORS to allow requests from the NUSMods frontend
//   - Validates that only POST requests are accepted (OPTIONS for CORS preflight)
//   - Parses the JSON request body into an OptimiserRequest
//   - Delegates to the solver to compute the optimal timetable
//
// Expected request body: JSON with modules, preferences, constraints
// Response: JSON with optimal timetable assignments, schedule, and shareable link.
func Handler(w http.ResponseWriter, r *http.Request) {
	// Allow CORS from all origins
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// only allow POST requests
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ctx := r.Context()
	start := time.Now()

	// Read the raw body first so we can log exactly what the client sent if
	// decoding fails below.
	body, err := io.ReadAll(r.Body)
	if err != nil {
		logger.ErrorContext(ctx, "failed to read request body", "error", err)
		http.Error(w, "Invalid request format", http.StatusBadRequest)
		return
	}

	// get selected modules from request
	var optimiserRequest models.OptimiserRequest
	if err = json.Unmarshal(body, &optimiserRequest); err != nil {
		logger.ErrorContext(ctx, "failed to decode request body", "error", err, "body", string(body))
		http.Error(w, "Invalid request format", http.StatusBadRequest)
		return
	}

	// Log the request as soon as it is decoded so we always have a record of
	// what the client sent, even if the solve below times out or panics.
	logger.InfoContext(ctx, "request received", "request", optimiserRequest)

	response, err := solver.Solve(optimiserRequest)
	if err != nil {
		code, message := logSolveError(ctx, err, optimiserRequest)
		http.Error(w, message, code)
		return
	}

	data, err := json.Marshal(response)
	if err != nil {
		logger.ErrorContext(ctx, "failed to encode response", "error", err, "request", optimiserRequest)
		http.Error(w, "JSON encoding failed", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if _, writeErr := w.Write(data); writeErr != nil {
		logger.ErrorContext(ctx, "failed to write response", "error", writeErr)
		return
	}

	logger.InfoContext(ctx, "solve succeeded",
		"modules", len(optimiserRequest.Modules),
		"score", response.Score,
		"durationMs", time.Since(start).Milliseconds(),
	)
}

// logSolveError logs a failed Solve call together with the client request that
// caused it, and returns the HTTP status code and message to send back.
//
// A SolveError carries a specific status code and message; anything else is
// treated as an internal server error. Client mistakes (4xx — invalid params,
// unknown module) are logged at Warn since they are not a server fault, while
// everything else is logged at Error.
func logSolveError(
	ctx context.Context,
	err error,
	request models.OptimiserRequest,
) (int, string) {
	code := http.StatusInternalServerError
	message := "Internal server error"
	var solveErr *models.SolveError
	if errors.As(err, &solveErr) {
		code = solveErr.Code
		message = solveErr.Message
	}

	if code >= http.StatusBadRequest && code < http.StatusInternalServerError {
		logger.WarnContext(ctx, "solve rejected request", "error", err, "request", request)
	} else {
		logger.ErrorContext(ctx, "solve failed", "error", err, "request", request)
	}
	return code, message
}
