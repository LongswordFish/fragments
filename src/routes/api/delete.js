// src/routes/api/delete.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require("../../model/fragment");
const logger = require('../../logger');

/**
 * Delete an existing fragment for the current user
 */
module.exports = async (req, res) => {
  try {
    logger.debug("Delete route");

    var _id = req.params._id;
    const ownerId = req.user;

    //try to get the fragment
    await Fragment.delete(ownerId, _id);

    res.status(200).json(createSuccessResponse());
  } catch (error) {
    createErrorResponse(404, error);
  }

};
