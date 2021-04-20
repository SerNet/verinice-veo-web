FROM node:12-alpine
# Install Git
RUN apk --no-cache add git
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package.json .
# For npm@5 or later, copy package-lock.json as well
COPY package-lock.json .
RUN npm install
# Bundle app source
COPY . .
CMD ["npm", "run","test"]
