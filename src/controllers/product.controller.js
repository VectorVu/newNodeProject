'use strict'

const productService = require("../services/product.service");
const productServiceV2 = require("../services/product.service.xxx");
const { SuccessResponse } = require("../core/success.response");
class ProductController {

    createProduct = async (req, res, next) => {
        // new SuccessResponse({
        //     message: 'Create Product Successfully',
        //     metaData: await productService.createProduct(
        //         req.body.product_type,
        //         {
        //             ...req.body,
        //             product_shop: req.shop.shopId
        //         }
        //     )
        // }).send(res);
        new SuccessResponse({
            message: 'Create Product Successfully',
            metaData: await productServiceV2.createProduct(
                req.body.product_type,
                {
                    ...req.body,
                    product_shop: req.shop.shopId
                }
            )
        }).send(res);

    }
}
module.exports = new ProductController();