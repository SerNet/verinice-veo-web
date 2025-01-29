#!/bin/bash

# This script extracts all local translations (<i18n>-Tags) from the SFCs into
# separate json files located at <~locales/base/[components|pages]/[file].json>
# It replaces these with a single <src-line>; e.g. *<i18n src="..."></i18n>*

HEADLINE="T-A-G  E-X-T-R-A-C-T-O-R"
SUB_DIRS=( 'components' 'pages' )
TARGET_PATH='./locales/base/'

CHAR_POS=0
while [ $CHAR_POS -lt ${#HEADLINE} ]; do
  echo -n "${HEADLINE:$CHAR_POS:1}"
  sleep .05
  (( CHAR_POS++ ))
done && echo -e "\n"

PS3="Which OS are you using? "

# set SED param according to OS to enable atomic grouping (ext)
select OS in Linux "OS X"; do
    [[ $REPLY -eq 1 ]] && SED_PARAM='-r' || SED_PARAM='-E'
    break
done

# check if SUB_DIR already exists; otherwise create it
for SUB_DIR in "${SUB_DIRS[@]}"; do
  [[ ! -d ${TARGET_PATH}${SUB_DIR} ]] && mkdir -p ${TARGET_PATH}${SUB_DIR} || echo "Directory <$SUB_DIR> already exists. Skipping ..."
done

# find all SFCs containing <i18n>-Tags
SFC=( $(find . -type f -name '*.vue' -exec grep -il '<i18n>' {} \;) )

for FILE in "${SFC[@]}"; do
# strip off CWD <'./'> at the start of the string
  STRIP_CWD=${FILE#*/}
# delete everything but the first dir. Results in [<components> | <pages>]
  SUB_FOLDER=${STRIP_CWD%%/*}
# strip off the path; replace all occurences of slashes by dashes; delete all brackets
  FILE_NAME_SANITIZED=$( echo ${FILE/vue/json} | /usr/bin/sed $SED_PARAM 's:.*(components|pages)/::; s:/:-:g; s:(\[|\])::g' )
# *kebab-case* the filename
  LC_FILE_NAME=$(perl -ne 'print lc s|[[:lower:]]\K[[:upper:]]|-$&|rg' <<< $FILE_NAME_SANITIZED)

  I18N_SRC="~/${TARGET_PATH#*/}$SUB_FOLDER/$LC_FILE_NAME"
  JSON_FILE_PATH="${TARGET_PATH}$SUB_FOLDER/$LC_FILE_NAME"

  # extract the translations and save the result into a new json-file
  /usr/bin/sed '/<i18n>/, /<\/i18n>/!d;//d' $FILE > $JSON_FILE_PATH

  # delete the translations from the original SFC and replace it with a single line sourcing the JSON-file created above
  if [[ $REPLY -eq 1 ]]; then
    # GNU_SED on *nix
    /usr/bin/sed -i -e '/<\/i18n>/a \\n<i18n src="'${I18N_SRC}'"></i18n>' -e '/<i18n>/, /<\/i18n>/d' $FILE
  else
    # BSD_SED on OS X
    /usr/bin/sed -i '' -e '/<\/i18n>/a\'$'\n''<i18n src="'"${I18N_SRC}"'"></i18n>' \
      -e '/<i18n>/,/<\/i18n>/d' "$FILE"
  fi
done

# output the amount of matches
echo "$(( ${#SFC[@]} )) files containing translations have been patched."

exit 0
