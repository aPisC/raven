#!/bin/bash

VERSION=$(echo $GITHUB_REF | sed 's/refs\/tags\/v//')

for WORKSPACE_PATH in workspaces/*; do
  FILE=${WORKSPACE_PATH}/package.json
  if [ -f "$FILE" ]; then
    jq " . + {
        version: \"$VERSION\", 
        dependencies: .dependencies 
            | [to_entries[]]
            | map({
              key: .key, 
              value: (if (.key | startswith(\"raven\")) then \"$VERSION\" else .value end)
            })
            | from_entries
    }" $FILE > $FILE.new
    mv $FILE.new $FILE
  fi
done
