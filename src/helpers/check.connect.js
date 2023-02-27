'use strict'

const mongoose = require('mongoose');
const os = require('os');
const { memoryUsage } = require('process');
const process = require('process');
const _SECONDS = 5000;
// count connect
const countConnect = () => {
    const numConnection = mongoose.connections.length;
    console.log(`Number of connections:: ${numConnection}`);
}

// check overload 
const checkOverload = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length;
        const numCores = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss;
        // Example maximum number of connections base on number of cores
        const maxConnections = numCores * 5;
        console.log(`Number of connections:: ${numConnection}`);
        console.log(`Menory usage:: ${memoryUsage / 1024 / 1024} MB`);
        if (numConnection > (maxConnections * 0.9)) {
            // 90% maxConnections de xu ly tinh huong kip thoi truoc khi sap server
            console.log(`Connection overload detected`);
        }
    }, _SECONDS) // Monitor every 5 seconds
};
module.exports = {
    countConnect,
    checkOverload
}