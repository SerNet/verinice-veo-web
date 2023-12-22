#!/bin/sh
# %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
# Installs a pre-commit hook.                               %%
# The hook formats code uses prettier to format code.       %%
# %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

GIT_DIR=$(git rev-parse --path-format=absolute --git-common-dir)
GIT_HOOKS=${GIT_DIR}/hooks/
PRECOMMIT_HOOK_SRC="scripts/format-pre-commit"
PRECOMMIT_HOOK_DST="pre-commit"

# Check if a pre-commit hook exists
if [[ -f "${GIT_HOOKS}${PRECOMMIT_HOOK_DST}" ]]; then
  echo $(tput setaf 200)
  echo "Hook already exists:$(tput sgr0)"
  echo "${GIT_HOOKS}${PRECOMMIT_HOOK_DST}"
  exit 1
else
  # Install pre-commit hook
  echo $(tput setaf 220)
  echo "Copying pre-commit hook into ${GIT_HOOKS}...$(tput sgr0)"
  cp ${PRECOMMIT_HOOK_SRC} ${GIT_HOOKS}/${PRECOMMIT_HOOK_DST}

  echo $(tput setaf 220)
  echo "Installing pre-commit hook...$(tput sgr0)"
  chmod u+x ${GIT_HOOKS}${PRECOMMIT_HOOK_DST}

  # Check if success pre-commit hook was successfully installed
  if [[ ${?} -eq 0 ]]; then
    echo $(tput setaf 042)
    echo "Successfully installed a pre-commit for code formatting."
    exit 0
  else
    echo $(tput setaf 200)
    echo "Something went wrong! Read console output above for more information.$(tput sgr0)"
    exit 1
  fi

fi

