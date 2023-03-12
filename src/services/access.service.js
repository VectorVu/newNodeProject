'use strict'
const shopModel = require('../models/shop.model');
const KeyTokenService = require('../services/keyToken.service');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { createTokenPair } = require('../auth/authUtils');
const { getInforData } = require('../utils');
const { BadRequestError, ConflictRequestError } = require('../core/error.response');
const roleShop = {
    SHOP: '001',
    WRITER: '002',
    EDITOR: '003',
    ADMIN: '004'
}
class AccessService {
    static signUp = async ({ email, password, name }) => {
        //check email
        const holderShop = await shopModel.findOne({ email: email }).lean();
        if (holderShop) {
            throw new BadRequestError('Error: Shop already registerd!');
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
            // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            //     modulusLength: 4096,
            //     publicKeyEncoding: {
            //         type: "pkcs1",
            //         format: "pem"
            //     },
            //     privateKeyEncoding: {
            //         type: "pkcs1",
            //         format: "pem"
            //     }
            // })
            const privateKey = crypto.randomBytes(64).toString('hex');
            const publicKey = crypto.randomBytes(64).toString('hex');

            console.log({ privateKey, publicKey });// save collection keyStore
            const keyStore = await KeyTokenService.createKeyToken({
                shopId: newShop._id,
                publicKey,
                privateKey
            });

            if (!keyStore) {
                throw new BadRequestError('Error: publicKeyString error!');
            }
            // created token pair
            // const publicKeyObject = crypto.createPublicKey(publicKeyString);
            const tokens = await createTokenPair({ shopId: newShop._id, email }, publicKey, privateKey);
            console.log(`Created Token Success:::`, tokens);
            return {
                code: 201,
                metaData: {
                    shop: getInforData({ fields: ['_id', 'name', 'email'], object: newShop }),
                    tokens
                }
            }
        }
        return {
            code: 200,
            metaData: null
        }
    }
}

module.exports = AccessService;