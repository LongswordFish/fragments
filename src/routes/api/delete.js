// // src/routes/api/delete.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require("../../model/fragment");

const logger = require("../../logger");

/**
 * Delete the fragment for the current user
 */
module.exports = async (req, res) => {
  try {
    logger.debug(`DELETE /fragments/${req.params._id} requested`);
    var _id = req.params._id;

    var fragment = await Fragment.byId(req.user, _id);

    logger.debug({ "fragment is": fragment });

    await Fragment.delete(req.user, _id);

    res.status(200).json(createSuccessResponse());
  } catch (err) {
    res.status(404).json(createErrorResponse(
      404, "Fragment doesn't exist"
    ));
  }

};
