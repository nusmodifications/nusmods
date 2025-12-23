package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	handler "github.com/nusmodifications/nusmods/website/api/optimiser"
)

func main() {
	portFlag := flag.Int("port", 8000, "Port to run the server on")
	flag.Parse()

	port := *portFlag
	if envPort := os.Getenv("PORT"); envPort != "" {
		if p, err := strconv.Atoi(envPort); err == nil {
			port = p
		}
	}

	http.HandleFunc("/optimise", handler.Handler)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, "NUSMods Optimiser Test Server\n")
		fmt.Fprintf(w, "Available endpoints:\n")
		fmt.Fprintf(w, "POST /optimise - Main optimiser endpoint\n")
	})

	addr := fmt.Sprintf(":%d", port)
	fmt.Printf("Starting NUSMods Optimiser test server on port %d\n", port)
	fmt.Printf("Server will be available at: http://localhost%s\n", addr)
	fmt.Printf("Optimiser endpoint: http://localhost%s/optimise\n", addr)

	log.Fatal(http.ListenAndServe(addr, nil))
}
