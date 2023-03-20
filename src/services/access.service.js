'use strict'
const shopModel = require('../models/shop.model');
const KeyTokenService = require('../services/keyToken.service');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { createTokenPair, verifyJWT } = require('../auth/authUtils');
const { getInforData, createToken } = require('../utils');
const { BadRequestError, AuthFailureError, ForbiddenError } = require('../core/error.response');
const { findByEmail } = require('./shop.service');
const roleShop = {
    SHOP: '001',
    WRITER: '002',
    EDITOR: '003',
    ADMIN: '004'
}
class AccessService {


    static handleRefreshToken = async (refreshToken) => {
        // check this token used?

        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken);
        if (foundToken) {
            // decode xem thong tin shop
            const { shopId, email } = verifyJWT(refreshToken, foundToken.privateKey);
            console.log({ shopId, email });
            // delete all key
            await KeyTokenService.deleteKey(shopId);
            throw new ForbiddenError("Something went wrong!!! Please Relogin");
        }
        // chua co
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
        if (!holderToken) {
            throw new AuthFailureError("Shop not registered");
        }
        // verify token
        const { shopId, email } = verifyJWT(refreshToken, holderToken.privateKey);
        console.log("2--- ", { shopId, email });
        // check shopId
        const foundShop = await findByEmail({ email });
        if (!foundShop) {
            throw new AuthFailureError("Shop not registered");
        }
        // create new tokens
        const tokens = await createTokenPair({ shopId, email }, holderToken.publicKey, holderToken.privateKey);
        // update token
        await holderToken.update({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokensUsed: refreshToken // da dung de lay token moi
            }
        });
        return {
            shop: { shopId, email },
            tokens
        }
    }

    static handleRefreshTokenV2 = async ({ refreshToken, shop, keyStore }) => {

        const { shopId, email } = shop;

        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await KeyTokenService.deleteKey(shopId);
            throw new ForbiddenError("Something went wrong!!! Please Relogin");
        }

        if (keyStore.refreshToken !== refreshToken) {
            throw new AuthFailureError("Shop not registered");
        }

        const foundShop = await findByEmail({ email });
        if (!foundShop) {
            throw new AuthFailureError("Shop not registered");
        }
        // create new tokens
        const tokens = await createTokenPair({ shopId, email }, keyStore.publicKey, keyStore.privateKey);
        // update token
        await keyStore.update({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokensUsed: refreshToken // da dung de lay token moi
            }
        });
        return {
            shop,
            tokens
        }
    }

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        console.log(delKey);
        return delKey;
    }

    static login = async ({ email, password, refreshToken = null }) => {
        //1 check email
        const foundShop = await findByEmail({ email });
        if (!foundShop) {
            throw new BadRequestError('Shop not registered!');
        }
        //2 match password
        const match = bcrypt.compareSync(password, foundShop.password);
        if (!match) {
            throw new AuthFailureError('Authentication Error');
        }
        //3 create token
        const privateKey = createToken();
        const publicKey = createToken();
        const { _id: shopId } = foundShop;
        //4 generate tokens
        const tokens = await createTokenPair({ shopId, email }, publicKey, privateKey);
        //
        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey,
            publicKey,
            shopId
        });

        return {
            metaData: {
                shop: getInforData({ fields: ['_id', 'name', 'email'], object: foundShop }),
                tokens
            }
        }
    }

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
            const privateKey = createToken();
            const publicKey = createToken();

            // console.log({ privateKey, publicKey });// save collection keyStore
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