#!/bin/bash
# Wait for SQL Server to be ready

set -e

host="$1"
port="${2:-1433}"
user="${3:-sa}"
password="$4"
shift 4
cmd="$@"

until /opt/mssql-tools/bin/sqlcmd -S "$host,$port" -U "$user" -P "$password" -Q "SELECT 1" > /dev/null 2>&1; do
  >&2 echo "SQL Server is unavailable - sleeping"
  sleep 1
done

>&2 echo "SQL Server is up - executing command"
exec $cmd