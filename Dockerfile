# syntax = docker/dockerfile:experimental@sha256:600e5c62eedff338b3f7a0850beb7c05866e0ef27b2d2e8c02aa468e78496ff5
FROM node:25-alpine@sha256:e80397b81fa93888b5f855e8bef37d9b18d3c5eb38b8731fc23d6d878647340f AS builder

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

FROM nginx:1.29@sha256:c881927c4077710ac4b1da63b83aa163937fb47457950c267d92f7e4dedf4aec AS release

COPY --from=builder /usr/src/app/.output/public /usr/src/app
RUN chown -R 0 /usr/src/app && chmod -R g+rwX /usr/src/app

# Add custom config to serve the index.html as entrypoint if the server would otherwise return a 404
COPY  nginx.conf /etc/nginx/conf.d/custom.conf

RUN mkdir -p /tmp/veo/app && chown -R 0 /tmp/veo && chmod -R g+rwX /tmp/veo
RUN mkdir -p /var/cache/nginx/client_temp && chown -R 0 /var/cache/nginx && chmod -R g+rwX /var/cache/nginx

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
