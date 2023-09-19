#!/bin/bash
file=$(find /usr/src/app -type f -print0 | xargs -0 grep -l api.veo.example)
sed -i "s,https://api\.veo\.example/veo,$VEO_DEFAULT_API_URL,g" $file
sed -i "s,https://api\.veo\.example/forms,$VEO_FORMS_API_URL,g" $file
sed -i "s,https://api\.veo\.example/history,$VEO_HISTORY_API_URL,g" $file
sed -i "s,https://api\.veo\.example/reporting,$VEO_REPORTING_API_URL,g" $file
sed -i "s,https://api\.veo\.example/accounts,$VEO_ACCOUNTS_API_URL,g" $file
sed -i "s,https://account\.veo\.example,$VEO_ACCOUNT_PATH,g" $file
sed -i "s,https://auth\.veo\.example/auth,$VEO_OIDC_URL,g" $file
sed -i "s/veo-oidcrealm-example/$VEO_OIDC_REALM/g" $file
sed -i "s/veo-oidcclient-example/$VEO_OIDC_CLIENT/g" $file
sed -i "s/https://auth\.veo\.example/auth/realms/veo-oidcrealm-example/account/$VEO_OIDC_ACCOUNT_APPLICATION/g" $file
nginx -c /etc/nginx/conf.d/custom.conf -g 'pid /tmp/nginx.pid; daemon off;'
