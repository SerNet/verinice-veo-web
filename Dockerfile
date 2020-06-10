# FROM tarampampam/node:13-alpine
FROM node:12-alpine
RUN apk --no-cache add git
RUN git --version
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package.json .
# For npm@5 or later, copy package-lock.json as well
COPY package-lock.json .
RUN npm install
RUN npm install git+https://veo-forms-package:AXMyChASHaLt16sPVmnF@git.cpmsys.de/sernet/verinice/veo-forms#41-veo-forms-als-plugin
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
