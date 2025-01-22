#!/bin/bash

rename=( $(find locales/base/ -type f -name '*.json') )

# rename all json files to <lower-kebab-case>
for name in "${rename[@]}"; do
  mv "$name" "${name,,}"
done

SFC=( $(find . -type f -name '*.vue' -exec grep -il '<i18n.*src.*>' {} \;) )

for file in ${SFC[@]}; do
	# redirect everything from STD_OUT to $file
	exec > $file
	grep -o '<i18n.*src.*>' $file | tr '[:upper:]' '[:lower:]'
done

exit 0

