// src/app.js

//express as the core 
const express = require('express');
//Cross-Origin Resource Sharing so it could visit resources in other origins
const cors = require('cors');
//secure your Express apps by setting various HTTP headers.
const helmet = require('helmet');
//compress the respond bodys
const compression = require('compression');

// modifications to src/app.js

const passport = require('passport');
const authorization = require('./authorization');

const logger = require('./logger');
const pino = require('pino-http')({
  // Use our default logger instance, which is already configured
  logger,
});

// Create an express app instance we can use to attach middleware and HTTP routes
const app = express();

//use the two functions to create responses
const { createErrorResponse } = require('./response');

// Use gzip/deflate compression middleware
app.use(compression());

// Use logging middleware
app.use(pino);

// Use security middleware
app.use(helmet());

// Use CORS middleware so we can make requests across origins
app.use(cors());

// Set up our passport authorization middleware
passport.use(authorization.strategy());
app.use(passport.initialize());

// Define our routes
app.use('/', require('./routes'));

// Add 404 middleware to handle any requests for resources that can't be found can't be found
app.use((req, res, next) => {
  next(createErrorResponse(404, 'not found'));
});


// Add error-handling middleware to deal with anything else
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // We may already have an error response we can use, but if not, use a generic
  // 500 server error and message.
  const status = err?.error?.code || 500;
  const message = err?.error?.message || 'unable to process request';

  // If this is a server error, log something so we can see what's going on.
  if (status > 499) {
    logger.error({ err }, `Error processing request`);
  }


  res.status(status).json(
    createErrorResponse(status, message)
  );


});

// Export our `app` so we can access it in server.js
module.exports = app;
