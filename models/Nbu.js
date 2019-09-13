const fs = require('fs')
const env = JSON.parse(fs.readFileSync('./.env', 'utf8'))
const logger = require('../logs')
const mysql = require('mysql2')
let connection = ''

function createConnection() {
    connection = mysql.createConnection({
        host: env.databaseSql.host,
        user: env.databaseSql.user,
        database: "bot_info",
        password: env.databaseSql.password,
        port: env.databaseSql.port
    });
}

module.exports.getNbu = function () {
    try {
        connection = ''
        createConnection()
        databaseStart()
    } catch (e) {
        logger.errLogger.error('Started ' + e);
    }

    let res = getInfo(databaseEnd)
    return res
}

function getInfo(callback) {
    let query = `SELECT * FROM NBU ORDER BY create_date DESC;`
    logger.appLogger.info(query)
    console.log(query)

    return new Promise(resolve => {
        connection.query(query,
            function (err, results, fields) {
                logger.errLogger.error(' query' + err);
                // logger.appLogger.info(results);
                // logger.appLogger.info(fields);
                resolve(results)
                callback()
            });
    })
}

function databaseStart() {
    connection.connect(function (err) {
        if (err) {
            logger.errLogger.error("Ошибка: " + err.message);
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
