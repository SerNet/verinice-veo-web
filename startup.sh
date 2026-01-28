#!/bin/bash

mkdir -p /tmp/veo/app && chown -R 0 /tmp/veo && chmod -R g+rwX /tmp/veo
mkdir -p /var/cache/nginx/proxy_temp
mkdir -p /var/cache/nginx/client_temp && chown -R 0 /var/cache/nginx && chmod -R g+rwX /var/cache/nginx

cp -r /usr/src/app /tmp/veo/

file=$(find /tmp/veo/app -type f -print0 | xargs -0 grep -l api.veo.example)
sed -i "s,https://api\.veo\.example/veo,$VEO_DEFAULT_API_URL,g" $file
sed -i "s,https://api\.veo\.example/forms,$VEO_FORMS_API_URL,g" $file
sed -i "s,https://api\.veo\.example/history,$VEO_HISTORY_API_URL,g" $file
sed -i "s,https://api\.veo\.example/reporting,$VEO_REPORTING_API_URL,g" $file
sed -i "s,https://api\.veo\.example/accounts,$VEO_ACCOUNTS_API_URL,g" $file
sed -i "s,https://account\.veo\.example,$VEO_ACCOUNT_PATH,g" $file
sed -i "s,https://auth\.veo\.example/auth/realms/veo-oidcrealm-example/account,$VEO_OIDC_ACCOUNT_APPLICATION,g" $file
sed -i "s,https://auth\.veo\.example/auth,$VEO_OIDC_URL,g" $file
sed -i "s,veo-oidcrealm-example,$VEO_OIDC_REALM,g" $file
sed -i "s,veo-oidcclient-example,$VEO_OIDC_CLIENT,g" $file
sed -i "s,veo-documentation-url-example,$VEO_DOCUMENTATION_URL,g" $file
sed -i "s,veo-hide-sernet-references-example,$VEO_HIDE_SERNET_REFERENCES,g" $file


# Get all feature flags passed to the environment and replace corresponding strings inside nuxt config with their values
PREFIX="VEO_FEATURE_FLAG";
while IFS='=' read -r var value; do # split env var into var name and value
  if [[ "${var}" == ${PREFIX}* ]]; then
    search_string="${var}_EXAMPLE"
    replace_value="${value}"
    sed -i "s,${search_string},${replace_value},g" $file
  fi
done < <(env)

nginx -c /etc/nginx/conf.d/custom.conf -g 'pid /tmp/nginx.pid; daemon off;'
