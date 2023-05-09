'use strict'

const { product, clothing, electronic, furniture } = require('../models/product.model');
const { BadRequestError } = require('../core/error.response');
const {
    findAllDraftsForShop,
    publishProductByShop,
    findAllPublishForShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById
} = require('../models/repositories/product.repo');
const { removeUndefinedObject, updateNestedObjectParser } = require('../utils');
// define factory class to create product
class ProductFactory {
    static productRegistry = {};

    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef;
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass) throw new BadRequestError(`Invalid Product Types ${type}`);
        return new productClass(payload).createProduct();
    }

    static async updateProduct(type, productId, payload) {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass) throw new BadRequestError(`Invalid Product Types ${type}`);
        return new productClass(payload).updateProduct(productId);
    }

    // query

    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true };
        return await findAllDraftsForShop({ query, limit, skip });
    }

    static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isPublished: true };
        return await findAllPublishForShop({ query, limit, skip });
    }

    static async searchProducts({ keySearch }) {
        return await searchProductByUser({ keySearch });
    }

    static async findAllProducts({ limit = 50, sort = 'ctime', page = 1, filter = { isPublished: true },
        select = ['product_name', 'product_price', 'product_thumb'] }) {
        return await findAllProducts({
            limit, sort, page, filter,
            select
        });
    }

    static async findProduct({ product_id, unSelect = ['__v'] }) {
        return await findProduct({ product_id, unSelect });
    }
    // end query


    // put 
    static async publishProductByShop({ product_shop, product_id }) {
        return await publishProductByShop({ product_shop, product_id });
    }

    static async unPublishProductByShop({ product_shop, product_id }) {
        return await unPublishProductByShop({ product_shop, product_id });
    }
    // end put
}

// define base product class
class Product {
    constructor({
        product_name,
        product_thumb,
        product_price,
        product_quantity,
        product_type,
        product_description,
        product_shop,
        product_attributes
    }) {
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_description = product_description
        this.product_shop = product_shop
        this.product_attributes = product_attributes
    }

    // create new product

    async createProduct(product_id) {
        return await product.create({ ...this, _id: product_id });
    }

    // update product
    async updateProduct(productId, bodyUpdate) {
        return await updateProductById({ productId, bodyUpdate, model: product });
    }
}

//define sub-class for different product types clothing
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newClothing) {
            throw new BadRequestError('create new clothing error')
        }
        const newProduct = await super.createProduct(newClothing._id);
        if (!newProduct) {
            throw new BadRequestError('create new product error');
        }
        return newProduct;
    }

    async updateProduct(productId) {
        /**
         * {
         *  a: undefined
         *  b: null
         * }
         */
        //1. remove attr has null | undefined 
        console.log(`[1]:: `, this);
        const objectParams = removeUndefinedObject(this);
        console.log(`[2]:: `, objectParams);
        //2. check xem update cho nao?
        if (objectParams.product_attributes) {
            const clearNull = removeUndefinedObject(objectParams.product_attributes);
            await updateProductById({
                productId,
                bodyUpdate: updateNestedObjectParser(clearNull),
                model: clothing
            });
        }
        const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams));
        return updateProduct;
    }
}

//define sub-class for different product types electronics
class Electronics extends Product {
    async createProduct() {
        const newElectronics = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newElectronics) {
            throw new BadRequestError('create new electronics error')
        }
        const newProduct = await super.createProduct(newElectronics._id);
        if (!newProduct) {
            throw new BadRequestError('create new product error');
        }
        return newProduct;
    }

    async updateProduct(productId) {
        /**
         * {
         *  a: undefined
         *  b: null
         * }
         */
        //1. remove attr has null | undefined 
        console.log(`[1]:: `, this);
        const objectParams = removeUndefinedObject(this);
        console.log(`[2]:: `, objectParams);
        //2. check xem update cho nao?
        if (objectParams.product_attributes) {
            const clearNull = removeUndefinedObject(objectParams.product_attributes);
            await updateProductById({
                productId,
                bodyUpdate: updateNestedObjectParser(clearNull),
                model: electronic
            });
        }
        const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams));
        return updateProduct;
    }
}

//define sub-class for different product types furniture
class Furnitures extends Product {
    async createProduct() {
        const newFurnitures = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newFurnitures) {
            throw new BadRequestError('create new Furnitures error')
        }
        const newProduct = await super.createProduct(newFurnitures._id);
        if (!newProduct) {
            throw new BadRequestError('create new product error');
        }
        return newProduct;
    }

    async updateProduct(productId) {
        /**
         * {
         *  a: undefined
         *  b: null
         * }
         */
        //1. remove attr has null | undefined 
        // console.log(`[1]:: `, this);
        const objectParams = removeUndefinedObject(this);
        // console.log(`[2]:: `, objectParams);
        //2. check xem update cho nao?
        if (objectParams.product_attributes) {
            const clearNull = removeUndefinedObject(objectParams.product_attributes);
            await updateProductById({
                productId,
                bodyUpdate: updateNestedObjectParser(clearNull),
                model: furniture
            });
        }
        const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams));
        return updateProduct;
    }
}

// register product type\
ProductFactory.registerProductType('Electronics', Electronics);
ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Furniture', Furnitures);


module.exports = ProductFactory;