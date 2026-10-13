#!/bin/sh
set -eu

: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
: "${APP_DB_PASSWORD:?APP_DB_PASSWORD is required}"

# The migration owner runs this once on a fresh database volume. The app password
# is read by psql from its environment rather than passed on its command line.
export PGPASSWORD="$POSTGRES_PASSWORD"
psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  --set=ON_ERROR_STOP=1 --set=db_name="$POSTGRES_DB" <<'SQL'
\getenv db_password APP_DB_PASSWORD
CREATE ROLE prachi_app LOGIN PASSWORD :'db_password'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
\unset db_password
REVOKE CONNECT ON DATABASE :"db_name" FROM PUBLIC;
GRANT CONNECT ON DATABASE :"db_name" TO prachi_app;
GRANT USAGE ON SCHEMA public TO prachi_app;
GRANT SELECT, INSERT, UPDATE ON organizations TO prachi_app;
GRANT SELECT, INSERT ON users TO prachi_app;
GRANT SELECT, INSERT, DELETE ON sessions TO prachi_app;
GRANT SELECT, INSERT, UPDATE ON records TO prachi_app;
GRANT INSERT ON audit_events TO prachi_app;
SQL
