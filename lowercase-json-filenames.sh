#!/bin/bash

json_files=( $(find locales/base/{components,pages}/ -type f -name '*.json') )

# rename all json files to <lower-kebab-case>
for json_file in "${json_files[@]}"; do
  file_name=${json_file##*/}
  file_path=${json_file%/*.*}

  patch_name=$(perl -ne 'print lc s|[[:lower:]]\K[[:upper:]]|-$&|rg' <<< $file_name)
  mv "$json_file" "$file_path/$patch_name" 2>/dev/null
done

SFC=( $(find . -type f -name '*.vue' -exec grep -il '<i18n.*src.*>' {} \;) )

# patch <i18n>-src-tags in vue files; works for GNU SED only
for vue_file in ${SFC[@]}; do
  # filter only the Tag-line
  match=$(grep -i '^<i18n.*src.*$' $vue_file)
  # patch the tag to kebab-case
  patched_tag=$(perl -ne 'print lc s|[[:lower:]]\K[[:upper:]]|-$&|rg' <<< $match)
  # apply patched path
  sed -ri '/<i18n.*src.*>/ s:^.*$:'"$patched_tag"':' $vue_file
done

exit 0
