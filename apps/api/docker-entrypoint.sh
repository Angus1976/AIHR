#!/bin/sh
echo "Waiting for database and running migrations..."
i=0
until npx prisma migrate deploy; do
  i=$((i + 1))
  if [ "$i" -ge 45 ]; then
    echo "Prisma migrate failed after retries"
    exit 1
  fi
  echo "retry $i ..."
  sleep 2
done
exec node dist/main.js
