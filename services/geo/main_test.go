package main

import (
	"encoding/json"
	"math"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealthIsPublic(t *testing.T) {
	handler := newHandler(func() string { return "secret" })

	request := httptest.NewRequest(http.MethodGet, "/health", nil)
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusOK)
	}
	if got := response.Header().Get("Content-Type"); got != "application/json" {
		t.Fatalf("Content-Type = %q, want application/json", got)
	}
}

func TestDistanceReturnsHaversineKilometers(t *testing.T) {
	handler := newHandler(func() string { return "secret" })
	request := httptest.NewRequest(http.MethodGet, "/distance?lat1=0&lon1=0&lat2=0&lon2=1", nil)
	request.Header.Set("Authorization", "Bearer secret")
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d; body = %s", response.Code, http.StatusOK, response.Body.String())
	}
	if got := response.Header().Get("Content-Type"); got != "application/json" {
		t.Fatalf("Content-Type = %q, want application/json", got)
	}

	var body struct {
		Kilometers float64 `json:"kilometers"`
	}
	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if math.Abs(body.Kilometers-111.195) > 0.01 {
		t.Fatalf("kilometers = %.6f, want approximately 111.195", body.Kilometers)
	}
}

func TestDistanceRejectsUnavailableTokenConfiguration(t *testing.T) {
	handler := newHandler(func() string { return "" })
	request := httptest.NewRequest(http.MethodGet, "/distance?lat1=0&lon1=0&lat2=0&lon2=1", nil)
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	if response.Code != http.StatusServiceUnavailable {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusServiceUnavailable)
	}
}

func TestDistanceRejectsUnauthorizedRequests(t *testing.T) {
	tests := []struct {
		name          string
		authorization string
	}{
		{name: "missing header"},
		{name: "wrong scheme", authorization: "Basic secret"},
		{name: "wrong token", authorization: "Bearer wrong"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			handler := newHandler(func() string { return "secret" })
			request := httptest.NewRequest(http.MethodGet, "/distance?lat1=0&lon1=0&lat2=0&lon2=1", nil)
			if test.authorization != "" {
				request.Header.Set("Authorization", test.authorization)
			}
			response := httptest.NewRecorder()

			handler.ServeHTTP(response, request)

			if response.Code != http.StatusUnauthorized {
				t.Fatalf("status = %d, want %d", response.Code, http.StatusUnauthorized)
			}
		})
	}
}

func TestDistanceRejectsInvalidCoordinates(t *testing.T) {
	tests := []struct {
		name  string
		query string
	}{
		{name: "missing latitude", query: "lon1=0&lat2=0&lon2=0"},
		{name: "missing longitude", query: "lat1=0&lat2=0&lon2=0"},
		{name: "non numeric", query: "lat1=abc&lon1=0&lat2=0&lon2=0"},
		{name: "NaN", query: "lat1=NaN&lon1=0&lat2=0&lon2=0"},
		{name: "positive infinity", query: "lat1=+Inf&lon1=0&lat2=0&lon2=0"},
		{name: "latitude above range", query: "lat1=90.0001&lon1=0&lat2=0&lon2=0"},
		{name: "latitude below range", query: "lat1=-90.0001&lon1=0&lat2=0&lon2=0"},
		{name: "longitude above range", query: "lat1=0&lon1=180.0001&lat2=0&lon2=0"},
		{name: "longitude below range", query: "lat1=0&lon1=-180.0001&lat2=0&lon2=0"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			handler := newHandler(func() string { return "secret" })
			request := httptest.NewRequest(http.MethodGet, "/distance?"+test.query, nil)
			request.Header.Set("Authorization", "Bearer secret")
			response := httptest.NewRecorder()

			handler.ServeHTTP(response, request)

			if response.Code != http.StatusBadRequest {
				t.Fatalf("status = %d, want %d", response.Code, http.StatusBadRequest)
			}
		})
	}
}

func TestServerUsesRequiredAddressAndTimeouts(t *testing.T) {
	server := newServer(http.NotFoundHandler())

	if server.Addr != "0.0.0.0:8080" {
		t.Fatalf("Addr = %q, want 0.0.0.0:8080", server.Addr)
	}
	if server.ReadTimeout <= 0 {
		t.Fatalf("ReadTimeout = %s, want a positive duration", server.ReadTimeout)
	}
	if server.WriteTimeout <= 0 {
		t.Fatalf("WriteTimeout = %s, want a positive duration", server.WriteTimeout)
	}
}
