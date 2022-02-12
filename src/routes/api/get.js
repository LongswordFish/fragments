// src/routes/api/get.js
const { createSuccessResponse } = require('../../response');
const { Fragment } = require("../../model/fragment");
const logger = require("../../logger");
const { createHash } = require('crypto');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    let expand = (req.query.expand && req.query.expand == 1) ? true : false;
    const ownerId = createHash('sha256').update(req.user).digest('hex');
    var fragments = await Fragment.byUser(ownerId, expand);
    res.status(200).json(createSuccessResponse({
      fragments
    }));
  } catch (err) {
    logger.error(err);
  }

};
