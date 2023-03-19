'use strict'

const express = require('express');
const { authentication } = require('../../auth/authUtils');
const accessController = require('../../controllers/access.controller');
const router = express.Router();
const { asyncHandler } = require('../../helpers/asyncHandler');

// sign up
router.post('/shop/signup', asyncHandler(accessController.signUp));
router.post('/shop/login', asyncHandler(accessController.login));

// authentication 
router.use(authentication);
///////////////////////////////
router.post('/shop/logout', asyncHandler(accessController.logout));


module.exports = router;