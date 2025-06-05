# syntax = docker/dockerfile:experimental
FROM node:23-alpine AS builder

# Install Git & Install Python for node-14
RUN apk --no-cache add git python3 make g++

# Create app directory
WORKDIR /usr/src/app
# Copy package.json and lock file
COPY package.json package-lock.json ./
# Install packages
RUN npm -d ci
# Bundle app source
COPY . .

ARG CI_COMMIT_REF_NAME=master
ARG CI_COMMIT_SHORT_SHA=latest
ARG CI_JOB_ID=-1
ARG VEO_DEBUG
ARG NODE_ENV=production

ENV VEO_DEFAULT_API_URL=
ENV VEO_FORMS_API_URL=
ENV VEO_HISTORY_API_URL=
ENV VEO_REPORTING_API_URL=
ENV VEO_ACCOUNTS_API_URL=
ENV VEO_ACCOUNT_PATH=
ENV VEO_OIDC_URL=
ENV VEO_OIDC_REALM=
ENV VEO_OIDC_CLIENT=
ENV VEO_OIDC_ACCOUNT_APPLICATION=
ENV VEO_DEBUG ${VEO_DEBUG}
ENV NODE_ENV=$NODE_ENV
ENV VEO_FEATURE_FLAG_CARD_VIEW=
ENV VEO_FEATURE_FLAG_USER_SETTINGS=
ENV VEO_BETA_MODE=

RUN echo ${CI_COMMIT_REF_NAME} > VERSION && echo ${CI_COMMIT_REF_NAME} > public/VERSION && echo ${CI_COMMIT_SHORT_SHA} > BUILD && echo ${CI_COMMIT_SHORT_SHA} > public/BUILD

RUN npm run generate && node externalize-scripts.mjs

FROM nginx:1.28 AS release

COPY --from=builder /usr/src/app/.output/public /usr/src/app

# Add custom config to serve the index.html as entrypoint if the server would otherwise return a 404
COPY  nginx.conf /etc/nginx/conf.d/custom.conf

COPY startup.sh /usr/src/app
RUN chmod +x /usr/src/app/startup.sh

ENV VEO_DEFAULT_API_URL=https://api.veo.example/veo
ENV VEO_FORMS_API_URL=https://api.veo.example/forms
ENV VEO_HISTORY_API_URL=https://api.veo.example/history
ENV VEO_REPORTING_API_URL=https://api.veo.example/reporting
ENV VEO_ACCOUNTS_API_URL=https://api.veo.example/accounts
ENV VEO_ACCOUNT_PATH=https://account.veo.example
ENV VEO_OIDC_URL=https://auth.veo.example/auth
ENV VEO_OIDC_REALM=veo-oidcrealm-example
ENV VEO_OIDC_CLIENT=veo-oidcclient-example
ENV VEO_OIDC_ACCOUNT_APPLICATION=https://auth.veo.example/auth/realms/veo-oidcrealm-example/account
ENV VEO_FEATURE_FLAG_CARD_VIEW=veo-feature-flag-card-view-example
ENV VEO_FEATURE_FLAG_USER_SETTINGS=feature-flag-user-settings-example
ENV VEO_BETA_MODE=veo-beta-mode-example

EXPOSE 80

CMD ["/usr/src/app/startup.sh"]
