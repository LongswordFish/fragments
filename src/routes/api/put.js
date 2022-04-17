// src/routes/api/put.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require("../../model/fragment");
const logger = require('../../logger');

/**
 * Update data for an existing fragment for the current user
 */
module.exports = async (req, res) => {
  try {
    logger.debug(`PUT /fragments/${req.params.id} requested`);

    //check if the content-type of the new data is supported
    if (Buffer.isBuffer(req.body) === false || !req.body) {
      res.status(415).json(createErrorResponse(
        415, "type not supported"
      ));
    } else {
      var id = req.params.id;
      var type = req.headers['content-type'];
      let fragment = new Fragment(await Fragment.byId(req.user, id));
      if (fragment.type !== type) {
        res.status(400).json(createErrorResponse(
          400, "Type doesn't match with existing fragment"
        ));
      } else {
        await fragment.save();
        await fragment.setData(req.body);

        res.status(200).json(createSuccessResponse({
          fragment
        }));
      }
    }


  } catch (err) {
    res.status(404).json(createErrorResponse(
      404, "Fragment doesn't exist"
    ));
  }


};
