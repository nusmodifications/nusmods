package api

import (
	"net/http"
	"fmt"
)

// Entry point for the API
func Handler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Hello, World!")
}