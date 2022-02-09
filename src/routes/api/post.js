// src/routes/api/get.js
const { createSuccessResponse } = require('../../response');

/**
 * Post a new fragments for the current user
 */
module.exports = (req, res) => {

  res.status(200).json(createSuccessResponse({
    fragments: [],
  }));
};
