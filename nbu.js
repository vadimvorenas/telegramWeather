try {
    const fs = require('fs')
    const env = JSON.parse(fs.readFileSync('./.env', 'utf8'))
    const logger = require('./logs')
    const https = require('https')
    const mysql = require('mysql2')
    const connection = mysql.createConnection({
        host: env.databaseSql.host,
        user: env.databaseSql.user,
        database: "bot_info",
        password: env.databaseSql.password,
        port: env.databaseSql.port
    });

    let date = new Date()
    date = formatDate(date)
    console.log(date)

    const currencies = {
        pln: `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=pln&date=${date}&json`,
        usd: `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=usd&date=${date}&json`,
        eur: `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=eur&date=${date}&json`,
        rub: `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=rub&date=${date}&json`,
    }
    connection.connect(function (err) {
        if (err) {
            logger.errLogger.error("Ошибка databaseStart: " + err.message);
        }
        else {
            logger.appLogger.info("Подключение к серверу MySQL успешно установлено");
            startCurrencies()
        }
    })

    function startCurrencies() {
        try {
            currenciesUrl(currencies['pln'],
                () => currenciesUrl(currencies['usd'],
                    () => currenciesUrl(currencies['eur'], () => {
                        currenciesUrl(currencies['rub'], () => {
                            connection.end(function (err) {
                                if (err) {
                                    logger.errLogger.error("Ошибка: " + err.message);
                                }
                                logger.appLogger.info("Подключение закрыто");
                            });
                        })
                    })))
        } catch (e) {
            logger.errLogger.error("Catch(startCurrencies): " + e);
        }
    }

    function currenciesUrl(url, callback = () => { }) {
        https.get(url, (res) => {
            res.setEncoding('utf8')
            res.on('data', function (chunk) {
                let result = JSON.parse(chunk)[0]
                logger.appLogger.info(result)
                setCurrencies({
                    name: result.txt,
                    price: result.rate,
                    currency: result.cc,
                    update_date: result.exchangedate
                }, callback)
            }).on('error', function(err){
                logger.errLogger.error("currenciesUrl (on.error): " + err);
            })
        })
    }

    function setCurrencies(data, callback) {
        let query = `INSERT INTO NBU (name, price, currency ,update_date)  VALUES (\'${data.name}\', \'${data.price}\', \'${data.currency}\', \'${data.update_date}\')`
        logger.appLogger.info(query)

        connection.query(query,
            function (err, results, fields) {
                logger.errLogger.error(err + ' query');
                logger.appLogger.info(results);
                logger.appLogger.info(fields);
                callback()
            });
    }
} catch (e) {
    console.log(e)
}

function formatDate(date) {

    var dd = date.getDate();
    if (dd < 10) dd = '0' + dd;
  
    var mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;
  
    var yy = date.getFullYear();
    if (yy < 10) yy = '0' + yy;
  
    return yy + mm + dd;
  }
