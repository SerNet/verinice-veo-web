#!/bin/bash

CI_NODE_INDEX=$1  # Node index passed from GitLab CI
TOTAL_NODES=$2    # Total number of parallel groups/nodes

echo "Running on node $CI_NODE_INDEX out of $TOTAL_NODES nodes"

# Collect all test files into an array
TEST_FILES=($(find cypress/e2e -type f -name "*.cy.ts"))

# Calculate the total number of test files
TOTAL_FILES=${#TEST_FILES[@]}

echo "Total number of test files: $TOTAL_FILES"

# Determine how many files each node should handle
FILES_PER_NODE=$((TOTAL_FILES / TOTAL_NODES))
REMAINDER=$((TOTAL_FILES % TOTAL_NODES))

# Assign test files to this node based on index
START_INDEX=$((CI_NODE_INDEX * FILES_PER_NODE))

if [ $CI_NODE_INDEX -lt $REMAINDER ]; then
  START_INDEX=$((START_INDEX + CI_NODE_INDEX))
  FILES_PER_NODE=$((FILES_PER_NODE + 1))
else
  START_INDEX=$((START_INDEX + REMAINDER))
fi

END_INDEX=$((START_INDEX + FILES_PER_NODE))

# Create an array of files for this node to execute
FILES_TO_RUN=("${TEST_FILES[@]:$START_INDEX:$FILES_PER_NODE}")

if [ ${#FILES_TO_RUN[@]} -eq 0 ]; then
  echo "No files to run on this node $CI_NODE_INDEX"
  exit 0
fi

echo "Files to run on node $CI_NODE_INDEX: ${FILES_TO_RUN[*]}"

# Run Cypress tests with the selected files
npx cypress run --spec "${FILES_TO_RUN[@]}" --env environment=local --browser firefox
