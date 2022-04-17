// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');

const { Fragment } = require("../../model/fragment");

// Create a router on which to mount our API endpoints
const router = express.Router();

//to parse the type
const contentType = require('content-type');

// Define our routes, which will be: GET /v1/fragments
//get data of a fragment
router.get('/fragments/:id', require('./get-by-id'));
//get the metadata of a fragment 
router.get('/fragments/:id/info', require('./get-by-id-info'));
//get all the fragments owned by the current user
router.get('/fragments', require('./get'));

//delete a fragment
router.delete('/fragments/:_id', require('./delete'));


// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      // See if we can parse this content type. If we can, `req.body` will be
      // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
      // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });

// Use a raw body parser for POST, which will give a `Buffer` Object or `{}` at `req.body`
router.post('/fragments', rawBody(), require('./post'));

//update a data
router.put('/fragments/:id', rawBody(), require('./put'));

// Other routes will go here later on...

module.exports = router;
