// src/routes/api/get.js
const { createSuccessResponse } = require('../../response');

// We want to log any crash cases so we can debug later from logs.
const logger = require('../../logger');

/**
 * Post a new fragments for the current user
 */
module.exports = (req, res) => {

  res.status(200).json(createSuccessResponse({
    fragments: [],
  }));
};
