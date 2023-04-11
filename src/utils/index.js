'use strict'
const crypto = require('crypto');
const _ = require('lodash');

const getInforData = ({ fields = [], object = {} }) => {
    return _.pick(object, fields);
}

const createToken = () => {
    return crypto.randomBytes(64).toString('hex');
}

const getSelectData = (select = [])=> {
    return Object.fromEntries(select.map(el => [el, 1]));
}

const unGetSelectData = (select = [])=> {
    return Object.fromEntries(select.map(el => [el, 0]));
}
module.exports = {
    getInforData,
    createToken,
    getSelectData,
    unGetSelectData
}