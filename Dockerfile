# syntax = docker/dockerfile:experimental
FROM node:19-alpine AS builder

# Install Git & Install Python for node-14
RUN apk --no-cache add git python3 make g++

# Create app directory
WORKDIR /usr/src/app
# Copy package.json and lock file
COPY package.json package-lock.json ./
# Install packages
RUN npm ci
# Bundle app source
COPY . .

ARG CI_COMMIT_REF_NAME=master
ARG CI_COMMIT_SHORT_SHA=latest
ARG CI_JOB_ID=-1
ARG VEO_DEFAULT_API_URL
ARG VEO_FORMS_API_URL
ARG VEO_HISTORY_API_URL
ARG VEO_REPORTING_API_URL
ARG VEO_ACCOUNTS_API_URL
ARG VEO_OIDC_URL
ARG VEO_OIDC_REALM
ARG VEO_OIDC_CLIENT
ARG VEO_DEBUG
ARG NODE_ENV=production

ENV CI_COMMIT_REF_NAME ${CI_COMMIT_REF_NAME}
ENV CI_COMMIT_SHORT_SHA ${CI_COMMIT_SHORT_SHA}
ENV CI_JOB_ID ${CI_JOB_ID}
ENV VEO_DEFAULT_API_URL ${VEO_DEFAULT_API_URL}
ENV VEO_FORMS_API_URL ${VEO_FORMS_API_URL}
ENV VEO_HISTORY_API_URL ${VEO_HISTORY_API_URL}
ENV VEO_REPORTING_API_URL ${VEO_REPORTING_API_URL}
ENV VEO_ACCOUNTS_API_URL ${VEO_ACCOUNTS_API_URL}
ENV VEO_OIDC_URL ${VEO_OIDC_URL}
ENV VEO_OIDC_REALM ${VEO_OIDC_REALM}
ENV VEO_OIDC_CLIENT ${VEO_OIDC_CLIENT}
ENV VEO_DEBUG ${VEO_DEBUG}
ENV NODE_ENV=$NODE_ENV

RUN echo ${CI_COMMIT_REF_NAME} > VERSION && echo ${CI_COMMIT_REF_NAME} > public/VERSION && echo ${CI_COMMIT_SHORT_SHA} > BUILD && echo ${CI_COMMIT_SHORT_SHA} > public/BUILD

RUN npm run generate
RUN node externalize-scripts.mjs

FROM ghcr.io/drpayyne/chrome-puppeteer:latest AS printer

# copy generated application and install dependencies
WORKDIR /usr/src/veo

COPY --chown=chrome --from=builder /usr/src/app/package.json /usr/src/app/package-lock.json /usr/src/app/nuxt.config.ts ./
COPY --chown=chrome --from=builder /usr/src/app/.output ./.output
COPY --from=builder /usr/src/app/node_modules ./node_modules

# copy print.mjs
WORKDIR /usr/src/app
COPY --chown=chrome print.mjs .
RUN mkdir dist

# Start nuxt app in background, wait for startup and generate pdf documentation
RUN nohup sh -c "(cd /usr/src/veo && (npm run start&))" && sleep 5 && node print.mjs

FROM nginx:1.21 AS release

COPY --from=printer /usr/src/veo/.output/public /usr/src/app
COPY --from=printer usr/src/app/dist/*.pdf /usr/src/app/

# Add custom config to serve the index.html as entrypoint if the server would otherwise return a 404
COPY  nginx.conf /etc/nginx/conf.d/custom.conf

EXPOSE 80

CMD ["nginx", "-c", "/etc/nginx/conf.d/custom.conf", "-g", "pid /tmp/nginx.pid; daemon off;"]
