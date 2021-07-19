FROM node:14-alpine
# Install Git
RUN apk --no-cache add git
# Install Python for node-14
RUN apk add python make g++
# Create app directory
WORKDIR /usr/src/app
# Copy .npmrc for installing @nbrx/eslint-config-nuxt
COPY .npmrc .
# Install app dependencies
COPY package.json .
# For npm@5 or later, copy package-lock.json as well
COPY package-lock.json .
RUN npm install
# Bundle app source
COPY . .

ARG CI_COMMIT_REF_NAME=master
ARG CI_COMMIT_SHA=latest

ENV CI_COMMIT_REF_NAME ${CI_COMMIT_REF_NAME}
ENV CI_COMMIT_SHA ${CI_COMMIT_SHA}

RUN echo ${CI_COMMIT_REF_NAME} > VERSION && echo ${CI_COMMIT_REF_NAME} > static/VERSION && echo ${CI_COMMIT_SHA} > BUILD && echo ${CI_COMMIT_SHA} > static/BUILD

ENV NODE_ENV production
ENV PORT 5000
RUN npm run build

EXPOSE 5000
CMD ["npm", "run","start"]
