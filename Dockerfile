# This is the docker file user could use to assemble the image of the fragment microservice

#################################################################################
# Stage 0: base stage

# Our image will reply on the node image so we don't need to install node again
# Use the 16.14-alpine3.14 version so the image will be smaller
FROM node:16.14-alpine3.14 AS base

LABEL maintainer="Jianchang Yu <jyu205@myseneca.ca>" \
      description="Fragments node.js microservice"

#define production mode
ENV NODE_ENV=production NPM_CONFIG_LOGLEVEL=warn NPM_CONFIG_COLOR=false

# Use /app as our working directory and then goes in that file
WORKDIR /app

# Copy the package.json and package-lock.json files into /app
COPY package.json package-lock.json ./

# Install node dependencies defined in package-lock.json
RUN npm ci --only=production

#################################################################################
# Stage 1: builder stage
FROM node:16.14-alpine3.14 AS builder

# Use /app as our working directory and then goes in that file
WORKDIR /app

# Copy files from base stage to new stage
COPY --from=base /app /app 

# Copy src to /app/src/
COPY . .

RUN apk add --no-cache dumb-init=1.2.5-r1

# Start the container by running our server
CMD ["dumb-init","node","/app/src/server.js"]

# We run our service on port 8080
EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=30s --start-period=5s --retries=3 \
 CMD curl --fail localhost:8080 || exit 1

