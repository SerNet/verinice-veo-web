#!/bin/bash

CI_NODE_INDEX=$1 # Node index passed from GitLab CI. This allows us to identify which parallel job is running on which node.
TOTAL_NODES=$2   # Total number of parallel groups/nodes. This defines how many parallel jobs are running in total.

echo "Running on node $CI_NODE_INDEX out of $TOTAL_NODES nodes"

# Collect all test files into an array
TEST_FILES=($(find cypress/e2e -type f -name "*.cy.ts"))

# Calculate the total number of test files
TOTAL_FILES=${#TEST_FILES[@]}

echo "Total number of test files: $TOTAL_FILES"

# Determine how many files each node should handle
# We divide the total files by the number of nodes to distribute the load evenly.
FILES_PER_NODE=$((TOTAL_FILES / TOTAL_NODES))

# Calculate the remainder, this ensures the extra files are handled by the first nodes.
REMAINDER=$((TOTAL_FILES % TOTAL_NODES))

# Assign test files to this node based on its index
# The start index for each node is calculated by multiplying the node index by the files per node.
START_INDEX=$((CI_NODE_INDEX * FILES_PER_NODE))

# Adjust the files per node for nodes that need to handle one more file due to the remainder
if [ $CI_NODE_INDEX -lt $REMAINDER ]; then
  START_INDEX=$((START_INDEX + CI_NODE_INDEX))
  FILES_PER_NODE=$((FILES_PER_NODE + 1))
else
  START_INDEX=$((START_INDEX + REMAINDER))
fi

END_INDEX=$((START_INDEX + FILES_PER_NODE))

# Create an array of files for this node to execute based on the calculated indexes
FILES_TO_RUN=("${TEST_FILES[@]:$START_INDEX:$FILES_PER_NODE}")

# If no files are assigned to this node, exit early
if [ ${#FILES_TO_RUN[@]} -eq 0 ]; then
  echo "No files to run on this node $CI_NODE_INDEX"
  exit 0
fi

echo "Files to run on node $CI_NODE_INDEX: ${FILES_TO_RUN[*]}"

# ---------------------------------
# cypress-parallel requires a directory as input.
# We cannot use the main cypress/e2e folder directly because it contains tests for all nodes.
# Each parallel job needs its own directory with only the tests assigned to it to avoid conflicts.
# So, we create a temporary directory, copy the selected test files for this node into it, and pass that directory to cypress-parallel.
# ---------------------------------

# Create a temporary directory inside cypress/e2e to isolate this node's tests
TMP_DIR=$(mktemp -d cypress/e2e/tmp.XXXXXX)
echo "Created temporary directory: $TMP_DIR"

# Copy the selected test files to the temporary directory
# This step ensures only the relevant files for this node are in the temp directory.
# Copy the test files to the temporary directory
for FILE in "${FILES_TO_RUN[@]}"; do
  cp "$FILE" "$TMP_DIR/"
done

# ---------------------------------
# Run Cypress tests with parallelism
# ---------------------------------
# We use 4 threads here as an optimal balance between speed and resource usage. This can be adjusted based on your system.
# Running 4 tests in a single job using the Electron browser to speed up execution without overloading the system.

# Explicitly using the -p flag to specify the reporter-config.json file because Cypress-Parallel  
# doesn't reliably detect reporter settings from the Cypress config file.  
# Without this flag, Cypress-Parallel defaults to its internal multi-reporter-config, ignoring custom reporters,  
# which results in missing test suite results (.json files not generated).  
# This workaround forces Cypress-Parallel to use the correct reporter settings, ensuring test results are captured  
# and preventing false failures due to mismatched test suite counts.  
npx cypress-parallel-extended -s cy:local -d "$TMP_DIR" -t 4 -m -p 'cypress/reporter/reporter-config.json' -x "$CI_NODE_INDEX"
TEST_RESULT=$? # Capture the exit code of the Cypress parallel test run

# Clean up the temporary directory after the tests run to avoid leaving unnecessary files behind
rm -rf "$TMP_DIR"

# Exit with the test result code to indicate success or failure
exit $TEST_RESULT

# ---------------------------------
# Alternative: Run without parallelism (single thread)
# ---------------------------------
# Uncomment the line below to run tests without parallel execution.
# This would be useful if you're testing locally or want to run everything sequentially on Firefox.
# npx cypress run --spec "${FILES_TO_RUN[@]}" --env environment=local --browser firefox
