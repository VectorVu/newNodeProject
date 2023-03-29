'use strict'
const JWT = require('jsonwebtoken');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { asyncHandler } = require('../helpers/asyncHandler');
const { finByShopId } = require('../services/keyToken.service');

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // access token

        const accessToken = await JWT.sign(payload, publicKey, {
            // algorithm: 'RS256',
            expiresIn: '2 days'
        });

        const refreshToken = await JWT.sign(payload, privateKey, {
            // algorithm: 'RS256',
            expiresIn: '7 days'
        });

        //
        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.log(`error verify:::`, err);
            } else {
                console.log(`decode verify:::`, decode);
            }
        });
        return { accessToken, refreshToken };
    } catch (error) {

    }
}

const authentication = asyncHandler(async (req, res, next) => {
    /**
     * 1 - check shopId missing ?
     * 2 - get accessToken
     * 3 - verify token
     * 4 - check shop in dbs
     * 5 - check keyStore with this shopId
     * 6 - Ok all - return next()
     */

    const shopId = req.headers[HEADER.CLIENT_ID];
    if (!shopId) {
        throw new AuthFailureError('Invalid Request');
    }

    const keyStore = await finByShopId(shopId);
    if (!keyStore) {
        throw new NotFoundError('Not found keyStore');
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) {
        throw new AuthFailureError('Invalid Request');
    }

    try {
        const decodeShop = JWT.verify(accessToken, keyStore.publicKey);
        if (shopId !== decodeShop.shopId) {
            throw new AuthFailureError('Invalid shopId');
        }
        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw error;
    }
})


const authenticationV2 = asyncHandler(async (req, res, next) => {
    /**
     * 1 - check shopId missing ?
     * 2 - get accessToken
     * 3 - verify token
     * 4 - check shop in dbs
     * 5 - check keyStore with this shopId
     * 6 - Ok all - return next()
     */

    const shopId = req.headers[HEADER.CLIENT_ID];
    if (!shopId) {
        throw new AuthFailureError('Invalid Request');
    }

    const keyStore = await finByShopId(shopId);
    if (!keyStore) {
        throw new NotFoundError('Not found keyStore');
    }

    if(req.headers[HEADER.REFRESHTOKEN]) {
        try {
            const refreshToken = req.headers[HEADER.REFRESHTOKEN];
            const decodeShop = JWT.verify(refreshToken, keyStore.privateKey);
            if (shopId !== decodeShop.shopId) {
                throw new AuthFailureError('Invalid shopId');
            }
            req.keyStore = keyStore;
            req.shop = decodeShop;
            req.refreshToken = refreshToken;
            return next();
        } catch (error) {
            throw error;
        }
    }
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) {
        throw new AuthFailureError('Invalid Request');
    }

    try {
        const decodeShop = JWT.verify(accessToken, keyStore.publicKey);
        if (shopId !== decodeShop.shopId) {
            throw new AuthFailureError('Invalid shopId');
        }
        req.keyStore = keyStore;
        req.shop = decodeShop;
        return next();
    } catch (error) {
        throw error;
    }
})

const verifyJWT = (token, keySecret) => {
    return JWT.verify(token, keySecret);
}
module.exports = {
    createTokenPair,
    authentication,
    verifyJWT,
    authenticationV2
}