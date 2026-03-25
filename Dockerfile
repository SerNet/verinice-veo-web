# syntax = docker/dockerfile:experimental@sha256:600e5c62eedff338b3f7a0850beb7c05866e0ef27b2d2e8c02aa468e78496ff5
FROM node:25-alpine@sha256:5209bcaca9836eb3448b650396213dbe9d9a34d31840c2ae1f206cb2986a8543 AS builder

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
ENV VEO_HIDE_SERNET_REFERENCES=

RUN echo ${CI_COMMIT_REF_NAME} > VERSION && echo ${CI_COMMIT_REF_NAME} > public/VERSION && echo ${CI_COMMIT_SHORT_SHA} > BUILD && echo ${CI_COMMIT_SHORT_SHA} > public/BUILD

RUN npm run generate && node externalize-scripts.mjs

FROM nginx:1.29@sha256:7150b3a39203cb5bee612ff4a9d18774f8c7caf6399d6e8985e97e28eb751c18 AS release

COPY --from=builder /usr/src/app/.output/public /usr/src/app
RUN chown -R 0 /usr/src/app && chmod -R g+rwX /usr/src/app

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
ENV VEO_HIDE_SERNET_REFERENCES=veo-hide-sernet-references-example

EXPOSE 80

CMD ["/usr/src/app/startup.sh"]
