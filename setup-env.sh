# %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
# Set up config files                                       %%
# for running veo and cypress in a docker container         %%
# Used for cypress e2e testing (ci pipeline)                %%
# %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

VEO_ENV_PATH=".env"
CY_CONFIG_DIR="cypress/config"
CY_CONFIG_LOCAL_PATH="${CY_CONFIG_DIR}/cypress.env.local.json"

# Write cypress config
if [[ -d "${CY_CONFIG_DIR}" ]]; then
  echo "${CY_CONFIG_DIR} exists"
else
  echo
  mkdir ${CY_CONFIG_DIR}
fi

CY_CONFIG_LOCAL='{
"testUser": {
  "name": "'${CYPRESS_TESTUSER_NAME}'",
  "pw": "'${CYPRESS_TESTUSER_PASS}'"
},
"keycloak": {
  "baseUrl": "'${KEYCLOAK_BASE_URL}'",
  "realm": "'${KEYCLOAK_BASE_REALM}'",
  "clientId": "'${KEYCLOAK_CLIENT_ID}'"
},
"baseUrl": "'${CYPRESS_BASE_URL_LOCAL}'",
"veoOidcUrl": "'${VEO_OIDC_URL}'",
"veoApiUrl" : "'${VEO_DEFAULT_API_URL}'",
"pipelineId": "'${CI_PIPELINE_ID}'",
"isLocalhost": "true",
"testUnitPrefix": "CY-TEST-pipeline-",
"dsgvoUnitId":"'${CYPRESS_DOMAIN_ID_DSGVO}'"
}'

echo ${CY_CONFIG_LOCAL} >> ${CY_CONFIG_LOCAL_PATH}

# Write veo config
echo VEO_DEFAULT_API_URL=${VEO_DEFAULT_API_URL} >> ${VEO_ENV_PATH}
echo VEO_FORMS_API_URL=${VEO_FORMS_API_URL} >> ${VEO_ENV_PATH}
echo VEO_HISTORY_API_URL=${VEO_HISTORY_API_URL} >> ${VEO_ENV_PATH}
echo VEO_REPORTING_API_URL=${VEO_REPORTING_API_URL} >> ${VEO_ENV_PATH}
echo VEO_ACCOUNTS_API_URL=${VEO_ACCOUNTS_API_URL} >> ${VEO_ENV_PATH}
echo VEO_OIDC_URL=${VEO_OIDC_URL} >> ${VEO_ENV_PATH}
echo VEO_OIDC_REALM=${VEO_OIDC_REALM} >> ${VEO_ENV_PATH}
echo VEO_OIDC_CLIENT=${VEO_OIDC_CLIENT} >> ${VEO_ENV_PATH}
echo VEO_ACCOUNT_PATH=${VEO_ACCOUNT_PATH} >> ${VEO_ENV_PATH}

