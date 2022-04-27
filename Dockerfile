# syntax = docker/dockerfile:experimental
FROM node:14-alpine AS builder

# Install Git & Install Python for node-14
RUN apk --no-cache add git python3 make g++

# Create app directory
WORKDIR /usr/src/app
# Copy .npmrc for installing @nbrx/eslint-config-nuxt and package.json and lock file
COPY .npmrc package.json package-lock.json ./
# Install packages
RUN npm ci
# Bundle app source
COPY . .

ARG CI_COMMIT_REF_NAME=master
ARG CI_COMMIT_SHA=latest
ARG CI_JOB_ID=-1
ARG VEO_DEFAULT_API_URL
ARG VEO_FORMS_API_URL
ARG VEO_HISTORY_API_URL
ARG VEO_REPORTING_API_URL
ARG VEO_OIDC_URL
ARG VEO_OIDC_REALM
ARG VEO_OIDC_CLIENT
ARG NODE_ENV=production

ENV CI_COMMIT_REF_NAME ${CI_COMMIT_REF_NAME}
ENV CI_COMMIT_SHA ${CI_COMMIT_SHA}
ENV CI_JOB_ID ${CI_JOB_ID}
ENV VEO_DEFAULT_API_URL ${VEO_DEFAULT_API_URL}
ENV VEO_FORMS_API_URL ${VEO_FORMS_API_URL}
ENV VEO_HISTORY_API_URL ${VEO_HISTORY_API_URL}
ENV VEO_REPORTING_API_URL ${VEO_REPORTING_API_URL}
ENV VEO_OIDC_URL ${VEO_OIDC_URL}
ENV VEO_OIDC_REALM ${VEO_OIDC_REALM}
ENV VEO_OIDC_CLIENT ${VEO_OIDC_CLIENT}
ENV NODE_ENV=$NODE_ENV

RUN echo ${CI_COMMIT_REF_NAME} > VERSION && echo ${CI_COMMIT_REF_NAME} > static/VERSION && echo ${CI_COMMIT_SHA} > BUILD && echo ${CI_COMMIT_SHA} > static/BUILD

RUN npm run generate

RUN pwd
RUN ls -la

FROM ghcr.io/drpayyne/chrome-puppeteer:latest AS printer

# copy generated application and install dependencies
WORKDIR /usr/src/veo
RUN pwd
RUN ls -la
COPY --from=builder /usr/src/app/dist /usr/src/app/.npmrc /usr/src/app/package.json /usr/src/app/package-lock.json /usr/src/app/nuxt.config.js ./
RUN npm ci

# copy print.js
WORKDIR /usr/src/app
COPY print.js .
RUN mkdir dist

# Start nuxt app in background, wait for startup and generate pdf documentation
RUN ((cd /usr/src/veo && (npm run start &)) && sleep 15 && node print.js

# Kill veo in background
RUN ps -ef | grep node
RUN pgrep node

# Copy files to veo dist folder to bundle it with application and copy it to project root to expose as artifacts
COPY /usr/src/app/dist/*.pdf "$CI_PROJECT_DIR/"
COPY /usr/src/app/dist/*.pdf /usr/src/veo/dist/


FROM nginx:1.21 AS release

COPY --from=printer /usr/src/veo/dist /usr/src/app

# Add custom config to serve the index.html as entrypoint if the server would otherwise return a 404
COPY  nginx.conf /etc/nginx/conf.d/custom.conf

RUN ls -la

EXPOSE 80

CMD ["nginx", "-c", "/etc/nginx/conf.d/custom.conf", "-g", "pid /tmp/nginx.pid; daemon off;"]
