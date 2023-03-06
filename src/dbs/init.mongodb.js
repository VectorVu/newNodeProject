'use strict'

const mongoose = require('mongoose');
const { db: { host, name, port } } = require('../configs/config.mongodb');
const connecString = `mongodb://${host}:${port}/${name}`;
const { countConnect, checkOverload } = require('../helpers/check.connect');


class Database {
    constructor() {
        this.connect()
    }

    // connect
    connect(type = 'mongodb') {
        if (1 === 1) {
            mongoose.set('debug', true)
            mongoose.set('debug', { color: true })
        }

        // mongoose.connect(connecString, { maxPoolSize: 49 }).then(_ => console.log(`Connected Mongodb ${name} Success version PRO`, checkOverload()))
        //     .catch(err => console.log(`Error Connect`))
        mongoose.connect(connecString, { maxPoolSize: 49 }).then(_ => console.log(`Connected Mongodb ${name} Success version PRO`))
            .catch(err => console.log(`Error Connect`))
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }

        return Database.instance;
    }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;