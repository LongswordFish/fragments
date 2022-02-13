const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require("../../model/fragment");

const logger = require("../../logger");
const { createHash } = require('crypto');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    const _ownerId = createHash('sha256').update(req.user).digest('hex');
    var _id = req.params._id;

    if (_id.indexOf(".txt") !== -1) {
      _id = _id.substring(0, _id.indexOf(".txt"));
    }
    var fragment = await Fragment.byId(_ownerId, _id);

    var data = await fragment.getData();

    logger.debug("data with id: " + _id + " is " + data);

    // res.setHeader('content-type', fragment.type);

    res.status(200).json(createSuccessResponse({
      fragment: data + ""
    }));
  } catch (err) {
    res.status(404).json(createErrorResponse(
      404, "Fragment doesn't exist"
    ));
  }

};
