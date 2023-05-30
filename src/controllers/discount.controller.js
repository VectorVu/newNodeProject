'use strict'

const DiscountService = require('../services/discount.service');
const { SuccessResponse } = require("../core/success.response");

class DiscountController {

    createDiscountCode = async(req, res, next) => {
        new SuccessResponse({
            message: "Successful Code Generations",
            metaData: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.shop.shopId
            })
        }).send(res)
    }

    getAllDiscountCodes = async(req, res, next) => {
        new SuccessResponse({
            message: "Successful Code Found",
            metaData: await DiscountService.getAllDiscountCodeByShop({
                ...req.query,
                shopId: req.shop.shopId
            })
        }).send(res)
    }

    getDiscountAmount = async(req, res, next) => {
        new SuccessResponse({
            message: "Successful Code Found",
            metaData: await DiscountService.getDiscountAmount({
                ...req.body
            })
        }).send(res)
    }

    getAllDiscountCodeWithProducts = async(req, res, next) => {
        new SuccessResponse({
            message: "Successful Code Found",
            metaData: await DiscountService.getAllDiscountCodeWithProduct({
                ...req.body
            })
        }).send(res)
    }

    getAllDiscountCodeByShop = async(req, res, next) => {
        new SuccessResponse({
            message: "Successful Code Found",
            metaData: await DiscountService.getAllDiscountCodeByShop({
                ...req.body
            })
        }).send(res)
    }


}

module.exports = new DiscountController();
