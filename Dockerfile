FROM node:alpine

# install wget 
RUN apk update && apk add --no-cache wget && \
    mkdir -p /app/node_modules

# copy code and install node deps
WORKDIR /home/node/app
COPY package*.json ./
COPY --chown=node:node . .
RUN npm install

# set workdir to /data
WORKDIR /data

# describe volume
VOLUME "/data"

# set entrypoint to script
ENTRYPOINT  [ "node", "/home/node/app/src/index.js" ]