// src/routes/api/get.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require("../../model/fragment");
const logger = require('../../logger');
const { createHash } = require('crypto');
/**
 * Post a new fragments for the current user
 */
module.exports = (req, res) => {

  logger.debug("Posting route");
  console.log(req.headers);
  if (Buffer.isBuffer(req.body) === false || !req.body) {
    res.status(415).json(createErrorResponse(
      415, "type not supported"
    ));
  }

  const { headers } = req;
  var type = headers['content-type'];

  const ownerId = createHash('sha256').update(req.user).digest('hex');
  const fragment = new Fragment({ ownerId, type });
  fragment.save();
  logger.debug("req.body is" + req.body);
  fragment.setData(req.body);

  res.location(`${process.env.API_URL}:8080/v1/fragments/${fragment.id}`);

  res.status(201).json(createSuccessResponse({
    fragment
  }));
};
