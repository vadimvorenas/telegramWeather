const fs = require('fs')
const env = JSON.parse(fs.readFileSync('./.env', 'utf8'))
const logger = require('./logs')
const https = require('https')
const mysql = require('mysql2')
const cron = require('node-cron')
const nbu = require('./models/NbuCron')
let connection = ''

const coints = {
    bitcoint: "https://api.coinmarketcap.com/v1/ticker/bitcoin/",
    bitcoin_cash: "https://api.coinmarketcap.com/v1/ticker/bitcoin-cash/",
    ethereum: "https://api.coinmarketcap.com/v1/ticker/ethereum/",
    litecoin: "https://api.coinmarketcap.com/v1/ticker/litecoin/",
    iota: "https://api.coinmarketcap.com/v1/ticker/iota/"
}

function cronStart() {
    let date = new Date()
    console.log(date)
    try {
        createConnection()
        databaseStart()
        let promise = new Promise((resolve, rej) => {
            resolve(nbu(connection, date))
        })
        promise.then((res) => {
            startCripto()
        })
            .catch(e => { console.log(e) })
    } catch (e) {
        logger.errLogger.error("startCripto  " + e);
    }
}

cronStart()
cron.schedule('0 */4 * * *', () => {
    let date = new Date()
    console.log(date)
    try {
        createConnection()
        databaseStart()
        let promise = new Promise((resolve, rej) => {
            resolve(nbu(connection, date))
        })
        promise.then((res) => {
            startCripto()
        })
            .catch(e => { console.log(e) })
    } catch (e) {
        logger.errLogger.error("startCripto  " + e);
    }
})


function startCripto() {
    cripto(coints['bitcoint'])
    cripto(coints['bitcoin_cash'])
    cripto(coints['ethereum'])
    cripto(coints['litecoin'])
    cripto(coints['iota'], () => {
        databaseEnd()
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
        res.on('error', function (e) {
            console.log(e)
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

function createConnection() {
    connection = mysql.createConnection({
        host: env.databaseSql.host,
        user: env.databaseSql.user,
        database: "bot_info",
        password: env.databaseSql.password,
        port: env.databaseSql.port
    });
}
