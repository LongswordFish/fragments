// src/routes/api/get.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require("../../model/fragment");
const logger = require('../../logger');

/**
 * Post a new fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    logger.debug("Posting route");
    if (Buffer.isBuffer(req.body) === false || !req.body) {
      res.status(415).json(createErrorResponse(
        415, "type not supported"
      ));
    }

    const { headers } = req;
    var type = headers['content-type'];

    const ownerId = req.user;
    const fragment = new Fragment({ ownerId, type });
    await fragment.save();
    logger.debug("req.body is" + req.body);
    await fragment.setData(req.body);

    res.location(`${process.env.API_URL}/v1/fragments/${fragment.id}`);

    res.status(201).json(createSuccessResponse({
      fragment
    }));
  } catch (error) {
    createErrorResponse(404, error);
  }

};
