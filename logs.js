const winston = require('winston')
let date = new Date()
date = `${date.getMonth()+1}-${date.getDate()}`

module.exports.appLogger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new (winston.transports.File)({
            filename: "logs/" + 'info-' + date + '.log',
            maxSize: '10m'
        })
    ]
})


module.exports.errLogger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    transports: [
        new (winston.transports.File)({
            filename: "logs/" + 'error' + date + '.log',
            maxSize: '10m'
        })
    ]
})
