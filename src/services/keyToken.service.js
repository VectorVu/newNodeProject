'use strict'

const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {
    static createKeyToken = async ({ shopId, publicKey, privateKey }) => {
        try {
            // const publicKeyString = publicKey.toString();
            const token = await keytokenModel.create({
                shop: shopId,
                publicKey,
                privateKey
            });
            return token ? token.publicKey : null;
        } catch (error) {
            return error;
        }
    }
}
module.exports = KeyTokenService;