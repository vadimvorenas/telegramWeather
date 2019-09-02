const fs = require('fs')
const env = JSON.parse(fs.readFileSync('./.env', 'utf8'))
const logger = require('./logs')
const https = require('https')
const http = require('http')
const mysql = require('mysql2')
const connection = mysql.createConnection({
    host: env.databaseSql.host,
    user: env.databaseSql.user,
    database: "bot_info",
    password: env.databaseSql.password,
    port: env.databaseSql.port
});

const coints = {
    bitcoint: "https://api.coinmarketcap.com/v1/ticker/bitcoin/",
    bitcoin_cash: "https://api.coinmarketcap.com/v1/ticker/bitcoin-cash/",
    ethereum: "https://api.coinmarketcap.com/v1/ticker/ethereum/",
    litecoin: "https://api.coinmarketcap.com/v1/ticker/litecoin/",
    iota: "https://api.coinmarketcap.com/v1/ticker/iota/"
}
connection.connect(function (err) {
    if (err) {
        logger.errLogger.error("Ошибка databaseStart: " + err.message);
    }
    else {
        logger.appLogger.info("Подключение к серверу MySQL успешно установлено");
        startCripto()
    }
})

function startCripto() {
    cripto(coints['bitcoint'])
    cripto(coints['bitcoin_cash'])
    cripto(coints['ethereum'])
    cripto(coints['litecoin'])
    cripto(coints['iota'], () => {
        connection.end(function (err) {
            if (err) {
                logger.errLogger.error("Ошибка: " + err.message);
            }
            logger.appLogger.info("Подключение закрыто");
        });
    })
}

function cripto(url, callback = () => { }) {
    https.get(url, (res) => {
        res.setEncoding('utf8')
        res.on('data', function (chunk) {
            let result = JSON.parse(chunk)[0]
            logger.appLogger.info(result)
            setCoints({
                name: result.name,
                price_usd: result.price_usd
            }, callback)
        })
    })
}

function setCoints(data, callback) {
    let query = `INSERT INTO \`${data.name}\` (price_usd) VALUES (\'${data.price_usd}\')`
    logger.appLogger.info(query)

    connection.query(query,
        function (err, results, fields) {
            logger.errLogger.error(err + ' query');
            logger.appLogger.info(results);
            logger.appLogger.info(fields);
            callback()
        });
    
}


function databaseStart() {
    connection.connect(function (err) {
        if (err) {
            logger.errLogger.error("Ошибка databaseStart: " + err.message);
        }
        else {
            logger.appLogger.info("Подключение к серверу MySQL успешно установлено");
        }
    })
}
function databaseEnd() {
    connection.end(function (err) {
        if (err) {
            logger.errLogger.error("Ошибка: " + err.message);
        }
        logger.appLogger.info("Подключение закрыто");
    });
}

