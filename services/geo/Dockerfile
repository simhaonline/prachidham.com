FROM golang:1.22-alpine AS build

WORKDIR /src
COPY go.mod ./
COPY main.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/geo-service .

FROM scratch

COPY --from=build /out/geo-service /geo-service
USER 65532:65532
EXPOSE 8080
ENTRYPOINT ["/geo-service"]
