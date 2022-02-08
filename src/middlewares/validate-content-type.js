const { createErrorResponse } = require('../response');

module.exports.ValidateContentType = function (req, res, next) {
  const { headers } = req;

  var type = headers['content-type'];


  if (!("content-type" in headers) || headers["content-type"] == null) {
    res.status(415).json(
      createErrorResponse(415, 'fragment type not supported')
    );

  }

  const supportedType = ["text/plain", "text/markdown", "text/html", "application/json", "image/png", "image/jpeg", "image/webp", "image/gif"];

  if (!supportedType.includes(type)) {
    res.status(415).json(
      createErrorResponse(415, 'fragment type not supported')
    );
  }

  next();
};
