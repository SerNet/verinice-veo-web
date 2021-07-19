FROM node:12-alpine
# Install Git
RUN apk --no-cache add git
ARG CI_PROJECT_DIR=/builds/nbrx/t1/veo
# Create app directory
WORKDIR ${CI_PROJECT_DIR}
# Copy .npmrc for installing @nbrx/eslint-config-nuxt
COPY .npmrc .
# Install app dependencies
COPY package.json .
# For npm@5 or later, copy package-lock.json as well
COPY package-lock.json .
RUN npm install
# Bundle app source
COPY . .
CMD ["npm", "run","test"]
