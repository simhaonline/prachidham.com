package main

import (
	"crypto/subtle"
	"encoding/json"
	"errors"
	"log"
	"math"
	"net/http"
	"os"
	"strconv"
	"time"
)

const earthRadiusKilometers = 6371.0

func main() {
	server := newServer(newHandler(func() string {
		return os.Getenv("INTERNAL_SERVICE_TOKEN")
	}))

	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}

func newServer(handler http.Handler) *http.Server {
	return &http.Server{
		Addr:              "0.0.0.0:8080",
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
}

func newHandler(token func() string) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("/distance", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		expectedToken := token()
		if expectedToken == "" {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "service authentication is not configured"})
			return
		}

		expectedAuthorization := "Bearer " + expectedToken
		if subtle.ConstantTimeCompare([]byte(r.Header.Get("Authorization")), []byte(expectedAuthorization)) != 1 {
			w.Header().Set("WWW-Authenticate", "Bearer")
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
			return
		}

		lat1, err := parseCoordinate(r, "lat1", -90, 90)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		lon1, err := parseCoordinate(r, "lon1", -180, 180)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		lat2, err := parseCoordinate(r, "lat2", -90, 90)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		lon2, err := parseCoordinate(r, "lon2", -180, 180)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}

		writeJSON(w, http.StatusOK, struct {
			Kilometers float64 `json:"kilometers"`
		}{Kilometers: haversineKilometers(lat1, lon1, lat2, lon2)})
	})

	return mux
}

func parseCoordinate(r *http.Request, name string, min, max float64) (float64, error) {
	value := r.URL.Query().Get(name)
	if value == "" {
		return 0, errors.New(name + " is required")
	}

	coordinate, err := strconv.ParseFloat(value, 64)
	if err != nil || math.IsNaN(coordinate) || math.IsInf(coordinate, 0) {
		return 0, errors.New(name + " must be a finite number")
	}
	if coordinate < min || coordinate > max {
		return 0, errors.New(name + " is out of range")
	}

	return coordinate, nil
}

func haversineKilometers(lat1, lon1, lat2, lon2 float64) float64 {
	lat1Radians := lat1 * math.Pi / 180
	lat2Radians := lat2 * math.Pi / 180
	deltaLatitude := (lat2 - lat1) * math.Pi / 180
	deltaLongitude := (lon2 - lon1) * math.Pi / 180

	haversine := math.Sin(deltaLatitude/2)*math.Sin(deltaLatitude/2) +
		math.Cos(lat1Radians)*math.Cos(lat2Radians)*math.Sin(deltaLongitude/2)*math.Sin(deltaLongitude/2)
	haversine = math.Min(1, math.Max(0, haversine))

	return 2 * earthRadiusKilometers * math.Asin(math.Sqrt(haversine))
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}
