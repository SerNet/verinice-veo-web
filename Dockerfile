FROM node:14-alpine AS builder

# Install Git & Install Python for node-14
RUN apk --no-cache add git python make g++

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

ENV CI_COMMIT_REF_NAME ${CI_COMMIT_REF_NAME}
ENV CI_COMMIT_SHA ${CI_COMMIT_SHA}
ENV CI_JOB_ID ${CI_JOB_ID}

RUN echo ${CI_COMMIT_REF_NAME} > VERSION && echo ${CI_COMMIT_REF_NAME} > static/VERSION && echo ${CI_COMMIT_SHA} > BUILD && echo ${CI_COMMIT_SHA} > static/BUILD

ENV PORT 5000
RUN npm run build

FROM node:14-alpine AS release

# Install Git & Install Python for node-14
RUN apk add --no-cache python make g++

ARG NODE_ENV=production

ENV NODE_ENV=$NODE_ENV

WORKDIR /usr/src/app

# Copy .npmrc for installing @nbrx/eslint-config-nuxt and package.json and lock file
COPY .npmrc package.json package-lock.json nuxt.config.js ./

# Install only production packages
RUN npm ci --production

COPY --from=builder /usr/src/app/.nuxt .nuxt

RUN apk del python make g++

EXPOSE 5000

ENV PORT 5000
CMD ["npm", "run", "start"]
