FROM node:14-alpine
# Install Git
RUN apk --no-cache add git
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
CMD ["npm", "run","test"]
