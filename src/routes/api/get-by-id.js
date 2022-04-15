const { createErrorResponse } = require('../../response');
const { Fragment } = require("../../model/fragment");

const path = require('path')

const logger = require("../../logger");


/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {

    var ext = path.extname(req.params.id);
    var id = path.basename(req.params.id, ext);

    logger.debug("ext is " + ext);
    logger.debug(`id is ` + id);

    let fragment = new Fragment(await Fragment.byId(req.user, id));

    if (fragment.isExtSupported(ext)) {
      logger.debug('content-type', fragment.convertContentType(ext));
      res.setHeader('content-type', fragment.convertContentType(ext));
      res.status(200).send(await fragment.convertData(ext));
    } else {
      res.status(415).json(createErrorResponse(
        415, "a " + fragment.type + " fragment cannot be returned as a " + ext
      ));
    }
  } catch (err) {
    res.status(404).json(createErrorResponse(
      404, "Fragment doesn't exist"
    ));
  }

};
