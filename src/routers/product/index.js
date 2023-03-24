'use strict'

const express = require('express');
const {  authenticationV2 } = require('../../auth/authUtils');
const productController = require('../../controllers/product.controller');
const router = express.Router();
const { asyncHandler } = require('../../helpers/asyncHandler');

// authentication 
router.use(authenticationV2);
///////////////////////////////
router.post('', asyncHandler(productController.createProduct));

module.exports = router;