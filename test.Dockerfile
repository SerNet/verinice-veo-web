FROM node:14-alpine
# Install Git
RUN apk --no-cache add git
# Install Python for node-14
RUN apk add python make g++
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
