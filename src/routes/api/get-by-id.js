const { createErrorResponse } = require('../../response');
const { Fragment } = require("../../model/fragment");

const logger = require("../../logger");

var MarkdownIt = require('markdown-it'),
  md = new MarkdownIt();



/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    const supportedTypePairs = {
      "text/plain": [".txt"],
      "text/markdown": [".md", ".html", ".txt"],
      //...
    }

    var _id = req.params._id;

    var ext = _id.lastIndexOf('.') == -1 ? "" : _id.substring(_id.lastIndexOf('.'));

    logger.debug("ext is " + ext);

    const isExtSupported = ext => {
      for (var key in supportedTypePairs) {
        if (supportedTypePairs[key].includes(ext))
          return true;
      }
      return false;
    }

    //1. if there is no ext, send data
    if ("" == ext) {
      let fragment = new Fragment(await Fragment.byId(req.user, _id));
      let data = await fragment.getData();
      res.setHeader('content-type', fragment.type);
      res.status(200).send(data);
    }
    //2. if the ext is supported
    else if (isExtSupported(ext)) {
      _id = _id.substring(0, _id.lastIndexOf("."));
      let fragment = new Fragment(await Fragment.byId(req.user, _id));

      //2.1 if can convert, convert and send
      if (supportedTypePairs[fragment.type].includes(ext)) {
        logger.debug(supportedTypePairs[fragment.type]);
        let data = await fragment.getData();
        //only consider the md to html now
        if (".html" === ext) {
          res.setHeader('content-type', 'text/html');
          res.status(200).send(Buffer.from(md.render(data.toString())));
        } else {
          //other text/plain will return the data for now until assignment3
          res.setHeader('content-type', fragment.type);
          res.status(200).send(data);
        }
      } else {
        //2.2 if can't convert, return 415
        res.status(415).json(createErrorResponse(
          415, "a " + fragment.type + " fragment cannot be returned as a " + ext
        ));
      }
    } else {
      //3. if the ext is not supported, return 415
      res.status(415).json(createErrorResponse(
        415, "The extension " + ext + " is not supported"
      ));
    }
  } catch (err) {
    res.status(404).json(createErrorResponse(
      404, "Fragment doesn't exist"
    ));
  }

};
