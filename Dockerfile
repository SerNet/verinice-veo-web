FROM node:alpine
# Create app directory
WORKDIR /usr/src/app
# Install git
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
# Install app dependencies
COPY package.json .
# For npm@5 or later, copy package-lock.json as well
COPY package-lock.json .
RUN npm install
# Bundle app source

COPY . .
COPY example.env .env

ENV NODE_ENV production
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
