const winston = require('winston')

module.exports.appLogger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new (winston.transports.File)({
            filename: "logs/" + 'info.log'
        })
    ]
})


module.exports.errLogger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    transports: [
        new (winston.transports.File)({
            filename: "logs/" + 'error.log'
        })
    ]
})
