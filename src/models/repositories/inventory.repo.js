'use strict'
const Inventory = require('../../models/inventory.model');
const { Types } = require('mongoose');
const insertInventory = async ({
    productId, shopId, stock, location = 'unknow'
}) => {
    return await Inventory.create({
        inven_productId: productId,
        inven_stock: stock,
        inven_location: location,
        inven_shopId: shopId
    })
}

module.exports = {
    insertInventory
}