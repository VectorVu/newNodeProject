'use strict'

const { product, clothing, electronic, furniture } = require('../models/product.model');
const { BadRequestError } = require('../core/error.response');
// define factory class to create product
class ProductFactory {
    static productRegistry = {};
    
    static registerProductType (type, classRef) {
        ProductFactory.productRegistry[type] = classRef; 
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type];
        if(!productClass) throw new BadRequestError(`Invalid Product Types ${type}`);
        return new productClass(payload).createProduct();
    }
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
}

// register product type\
ProductFactory.registerProductType('Electronics', Electronics);
ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Furniture', Furnitures);


module.exports = ProductFactory;