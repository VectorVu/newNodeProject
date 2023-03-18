'use strict'
const crypto = require('crypto');
const _ = require('lodash');

const getInforData = ({ fields = [], object = {} }) => {
    return _.pick(object, fields);
}

const createToken = () => {
    return crypto.randomBytes(64).toString('hex');
}
module.exports = {
    getInforData,
    createToken
}