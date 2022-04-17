const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require("../../model/fragment");

const logger = require("../../logger");

/**
 * Get the fragment metadata for the current user
 */
module.exports = async (req, res) => {
  try {
    logger.debug(`Get GET /fragments/${req.params.id}/info requested`);
    var id = req.params.id;

    let fragment = new Fragment(await Fragment.byId(req.user, id));

    logger.debug("fragment with id: " + id + " is " + fragment);

    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    res.status(404).json(createErrorResponse(
      404, "Fragment doesn't exist"
    ));
  }

};
