#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(pwd)
echo "[split] Starting frontend/backend split in repository: ${ROOT_DIR}"

# Move backend code to backend/ if not present
if [ -d src/main/java ] || [ -d src/main/resources ]; then
  mkdir -p backend/src/main/java
  mkdir -p backend/src/main/resources
  if [ -d src/main/java ]; then
    git mv src/main/java backend/src/main/java || true
  fi
  if [ -d src/main/resources ]; then
    git mv src/main/resources backend/src/main/resources || true
  fi
fi

# Move root pom.xml to backend/ if present
if [ -f pom.xml ]; then
  git mv pom.xml backend/pom.xml || true
fi

# Move frontend Vue/React app if under frontend/hjzdm-frontend to a dedicated frontend/ module
if [ -d frontend/hjzdm-frontend ]; then
  mkdir -p frontend
  git mv frontend/hjzdm-frontend frontend/hjzdm-frontend || true
fi

echo "[split] Split completed. Review the changes and adjust any path references in build configs accordingly."
