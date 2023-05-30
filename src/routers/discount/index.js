'use strict'

const express = require('express');
const {  authenticationV2 } = require('../../auth/authUtils');
const DiscountController = require('../../controllers/discount.controller');
const router = express.Router();
const { asyncHandler } = require('../../helpers/asyncHandler');

router.post('/amount', asyncHandler(DiscountController.getDiscountAmount));
router.get('/list_product_code', asyncHandler(DiscountController.getAllDiscountCodeWithProducts));
router.get('/list_code_shop', asyncHandler(DiscountController.getAllDiscountCodeByShop));

router.use(authenticationV2);


router.post('', asyncHandler(DiscountController.createDiscountCode));
router.get('', asyncHandler(DiscountController.getAllDiscountCodes));

module.exports = router;