'use strict'
const shopModel = require('../models/shop.model');
const KeyTokenService = require('../services/keyToken.service');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const roleShop = {
    SHOP: '001',
    WRITER: '002',
    EDITOR: '003',
    ADMIN: '004'
}
class AccessService {
    static signUp = async ({ email, password, name }) => {
        try {
            //check email
            const holderShop = await shopModel.findOne({ email: email }).lean();
            if (holderShop) {
                return {
                    code: 'xxx',
                    message: 'shop already registered!'
                }
            }
            const passwordHash = await bcrypt.hash(password, 10);
            const newShop = await shopModel.create({
                name,
                password: passwordHash,
                email,
                roles: [roleShop.SHOP]
            });
            if (newShop) {
                // create pirvate key and public key
                const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 4096
                })
                console.log({ privateKey, publicKey });// save collection keyStore
                const publicKeyString = await KeyTokenService.createKeyToken({
                    shopId: newShop._id,
                    publicKey
                });

                if (!publicKeyString) {
                    return {
                        code: 'xxx',
                        message: 'publicKeyString error'
                    }
                }
            }
        } catch (error) {
            return {
                code: 'xxx',
                message: error.message,
                status: 'error'
            }
        }
    }
}

module.exports = AccessService;