# %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
# Set up an .env file for running veo in a docker container %%
# Used during cypress testing (ci pipeline)                 %%
# %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

echo VEO_DEFAULT_API_URL=${VEO_DEFAULT_API_URL} >> .env
echo VEO_FORMS_API_URL=${VEO_FORMS_API_URL} >> .env
echo VEO_HISTORY_API_URL=${VEO_HISTORY_API_URL} >> .env
echo VEO_REPORTING_API_URL=${VEO_REPORTING_API_URL} >> .env
echo VEO_ACCOUNTS_API_URL=${VEO_ACCOUNTS_API_URL} >> .env
echo VEO_OIDC_URL=${VEO_OIDC_URL} >> .env
echo VEO_OIDC_REALM=${VEO_OIDC_REALM} >> .env
echo VEO_OIDC_CLIENT=${VEO_OIDC_CLIENT} >> .env
echo VEO_ACCOUNT_PATH=${VEO_ACCOUNT_PATH} >> .env

