'use strict'

const AccessService = require("../services/access.service");
const { OK, CREATED, SuccessResponse } = require("../core/success.response");
class AccessController {

    handleRefreshToken = async (req, res, next) => {
        // new SuccessResponse({
        //     message: "Get token success",
        //     metaData: await AccessService.handleRefreshToken(req.body.refreshToken)
        // }).send(res);

        //v2 fixed
        new SuccessResponse({
            message: "Get token success",
            metaData: await AccessService.handleRefreshTokenV2({
                refreshToken: req.refreshToken,
                shop: req.shop,
                keyStore: req.keyStore
            })
        }).send(res);

    }

    logout = async (req, res, next) => {
        new SuccessResponse({
            message: "Logout success",
            metaData: await AccessService.logout(req.keyStore)
        }).send(res);
    }

    login = async (req, res, next) => {
        new SuccessResponse({
            metaData: await AccessService.login(req.body)
        }).send(res);
    }
    signUp = async (req, res, next) => {
        new CREATED({
            message: 'Registered OK!',
            metaData: await AccessService.signUp(req.body),
            options: {
                limit: 10
            }
        }).send(res);
    }
}
module.exports = new AccessController();