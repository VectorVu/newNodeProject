'use strict'

const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {
    static createKeyToken = async ({ shopId, publicKey }) => {
        try {
            const publicKeyString = publicKey.toString();
            const token = await keytokenModel.create({
                shop: shopId,
                publicKey: publicKeyString
            });
            return token ? publicKeyString : null;
        } catch (error) {
            return error;
        }
    }
}
module.exports = KeyTokenService;