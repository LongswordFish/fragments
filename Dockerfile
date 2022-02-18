# This is the docker file user could use to assemble the image of the fragment microservice

# Our image will reply on the node image so we don't need to install node again
# with the node version same to mine 
FROM node:16.13.2

LABEL maintainer="Jianchang Yu <jyu205@myseneca.ca>" \
      description="Fragments node.js microservice"

# Set up enviroment variables: we don't want to include secrets, 
# nor do we want to define things that will always be different. 

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory and then goes in that file
WORKDIR /app

# Copy the package.json and package-lock.json files into /app
COPY package.json package-lock.json ./

# Install node dependencies defined in package-lock.json
RUN npm install

# Copy src to /app/src/
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Start the container by running our server
CMD npm start

# We run our service on port 8080
EXPOSE 8080

