// src/routes/api/put.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require("../../model/fragment");
const logger = require('../../logger');

/**
 * Update data for an existing fragment for the current user
 */
module.exports = async (req, res) => {
  try {
    logger.debug("Put route");

    //check if the content-type of the new data is supported
    if (Buffer.isBuffer(req.body) === false || !req.body) {
      res.status(400).json(createErrorResponse(
        400, "type not supported"
      ));
    }

    var _id = req.params._id;
    const ownerId = req.user;
    var type = req.headers['content-type'];
    //try to get the fragment
    var fragment = await Fragment.byId(ownerId, _id);
    logger.debug("fragment with id: " + _id + " is " + fragment);

    if (fragment.type !== type) {
      res.status(400).json(createErrorResponse(
        400, "Type doesn't match with existing fragment"
      ));
    }

    await fragment.save();
    await fragment.setData(req.body);

    res.location(`${process.env.API_URL}/v1/fragments/${fragment.id}`);

    res.status(200).json(createSuccessResponse({
      fragment
    }));
  } catch (error) {
    createErrorResponse(404, error);
  }

};
