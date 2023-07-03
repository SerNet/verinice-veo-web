FROM node:19-alpine
# Install Git
RUN apk --no-cache add git
# Install Python for node-19
RUN apk add python3 make g++
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package.json .
# For npm@5 or later, copy package-lock.json as well
COPY package-lock.json .
RUN npm -d --legacy-peer-deps ci
# Bundle app source
COPY . .

CMD ["npm", "run","test"]
