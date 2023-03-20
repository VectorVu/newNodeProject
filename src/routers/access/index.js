'use strict'

const express = require('express');
const { authentication, authenticationV2 } = require('../../auth/authUtils');
const accessController = require('../../controllers/access.controller');
const router = express.Router();
const { asyncHandler } = require('../../helpers/asyncHandler');

// sign up
router.post('/shop/signup', asyncHandler(accessController.signUp));
router.post('/shop/login', asyncHandler(accessController.login));

// authentication 
router.use(authenticationV2);
///////////////////////////////
router.post('/shop/logout', asyncHandler(accessController.logout));
router.post('/shop/handleRefreshToken', asyncHandler(accessController.handleRefreshToken));


module.exports = router;