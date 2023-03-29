'use strict'

const productService = require("../services/product.service");
const { SuccessResponse } = require("../core/success.response");
class ProductController {

    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create Product Successfully',
            metaData: await productService.createProduct(
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