'use strict'

const productService = require("../services/product.service");
const productServiceV2 = require("../services/product.service.xxx");
const { SuccessResponse } = require("../core/success.response");
class ProductController {


     /// post

     publishProductByShop = async (req, res, next)=> {
        new SuccessResponse({
            message: 'Publish product Successfully',
            metaData: await productServiceV2.publishProductByShop(
                {
                    product_shop: req.shop.shopId,
                    product_id: req.params.id
                }
            )
        }).send(res);
    }

    unPublishProductByShop = async (req, res, next)=> {
        new SuccessResponse({
            message: 'Un publish product Successfully',
            metaData: await productServiceV2.unPublishProductByShop(
                {
                    product_shop: req.shop.shopId,
                    product_id: req.params.id
                }
            )
        }).send(res);
    }

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

    /// query
    /**
     * @desc Get all Draft for shop
     * @param {Number} limit 
     * @param {Number} skip 
     * @return {JSON}  
     */
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get List draft Successfully',
            metaData: await productServiceV2.findAllDraftsForShop(
                {
                    product_shop: req.shop.shopId
                }
            )
        }).send(res);
    }

    getAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get List publish Successfully',
            metaData: await productServiceV2.findAllPublishForShop(
                {
                    product_shop: req.shop.shopId
                }
            )
        }).send(res);
    }

    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get List search publish Successfully',
            metaData: await productServiceV2.searchProducts(req.params)
        }).send(res);
    }

    findAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all publish product Successfully',
            metaData: await productServiceV2.findAllProducts(req.query)
        }).send(res);
    }

    findProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get product detail Successfully',
            metaData: await productServiceV2.findProduct({
                product_id: req.params.product_id
            })
        }).send(res);
    }
    /// end query

}
module.exports = new ProductController();