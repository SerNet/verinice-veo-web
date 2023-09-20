# syntax = docker/dockerfile:experimental
FROM node:19-alpine AS builder

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

RUN echo ${CI_COMMIT_REF_NAME} > VERSION && echo ${CI_COMMIT_REF_NAME} > public/VERSION && echo ${CI_COMMIT_SHORT_SHA} > BUILD && echo ${CI_COMMIT_SHORT_SHA} > public/BUILD

RUN npm run generate && node externalize-scripts.mjs

FROM ghcr.io/drpayyne/chrome-puppeteer:latest AS printer

# copy generated application and install dependencies
WORKDIR /usr/src/veo

COPY --chown=chrome --from=builder /usr/src/app/package.json /usr/src/app/package-lock.json /usr/src/app/nuxt.config.ts ./
# We also have to copy the modules folder because modules/docs/module.mjs is referneced in the nuxt.config.ts
COPY --chown=chrome --from=builder /usr/src/app/modules ./modules
# Same goes for types/locales
COPY --chown=chrome --from=builder /usr/src/app/types ./types
COPY --chown=chrome --from=builder /usr/src/app/.output ./.output
COPY --from=builder /usr/src/app/node_modules ./node_modules

# copy print.mjs
WORKDIR /usr/src/app
COPY --chown=chrome print.mjs .
RUN mkdir dist

# Start nuxt app in background, wait for startup and generate pdf documentation
RUN nohup sh -c "(cd /usr/src/veo && (npm run start&))" && sleep 20 && node print.mjs

FROM nginx:1.25 AS release

COPY --from=printer /usr/src/veo/.output/public /usr/src/app
COPY --from=printer usr/src/app/dist/*.pdf /usr/src/app/

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
ENV VEO_OIDC_CLIENT=veo-oidcclient-example
ENV VEO_OIDC_ACCOUNT_APPLICATION=https://auth.veo.example/auth/realms/veo-oidcrealm-example/account

EXPOSE 80

CMD ["/usr/src/app/startup.sh"]
