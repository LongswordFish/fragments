const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require("../../model/fragment");

const logger = require("../../logger");
const { createHash } = require('crypto');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    logger.debug(`Get GET /fragments/${req.params._id}/info requested`);
    const _ownerId = createHash('sha256').update(req.user).digest('hex');
    var _id = req.params._id;

    var fragment = await Fragment.byId(_ownerId, _id);

    logger.debug("fragment with id: " + _id + " is " + fragment);

    res.status(200).json(createSuccessResponse({
      fragment
    }));
  } catch (err) {
    res.status(404).json(createErrorResponse(
      404, "Fragment doesn't exist"
    ));
  }

};
