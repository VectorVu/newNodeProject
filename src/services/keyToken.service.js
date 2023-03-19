'use strict'

const keytokenModel = require("../models/keytoken.model");
const { Types } = require('mongoose');
class KeyTokenService {
    static createKeyToken = async ({ shopId, publicKey, privateKey, refreshToken }) => {
        try {
            // const publicKeyString = publicKey.toString();
            // level 0
            // const token = await keytokenModel.create({
            //     shop: shopId,
            //     publicKey,
            //     privateKey
            // });
            // return token ? token.publicKey : null;

            //level xxxx
            // console.log({ shopId, publicKey, privateKey, refreshToken });
            const filter = { shop: shopId };
            const update = { publicKey, privateKey, refreshTokensUsed: [], refreshToken };
            const options = { upsert: true, new: true };
            const tokens = await keytokenModel.findOneAndUpdate(filter, update, options);
            // console.log("tokens::: ", tokens);
            return tokens ? tokens.publicKey : null;
        } catch (error) {
            return error;
        }
    }

    static finByShopId = async (shopId) => {
        return await keytokenModel.findOne({ shop: Types.ObjectId(shopId) }).lean();
    }

    static removeKeyById = async (id) => {
        return await keytokenModel.remove(id);
    }
}
module.exports = KeyTokenService;