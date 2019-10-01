
const logger = require('../logs')
const https = require('https')
let connection = ''
let currencies = false

module.exports = (mysql, date) => {
    connection = mysql
    date = formatDate(date)
    currencies = {
        pln: `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=pln&date=${date}&json`,
        usd: `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=usd&date=${date}&json`,
        eur: `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=eur&date=${date}&json`,
        rub: `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=rub&date=${date}&json`,
    }
    return new Promise((resolve, rej) => {
        resolve(startCurrencies())
    })
}

function startCurrencies() {
    if (!currencies) {
        return false
    }
    return new Promise((resolve, reject) => {
        httpGet(currencies['pln'])
            .then(response => {
                return setCurrencies(response)
            })
            .then(response => {
                return httpGet(currencies['usd'])
            })
            .then(response => {
                setCurrencies(response)
                return httpGet(currencies['eur'])
            })
            .then(response => {
                setCurrencies(response)
                return httpGet(currencies['rub'])
            })
            .then(response => {
                resolve(setCurrencies(response))
            })
            .catch(e => {
                logger.errLogger.error("Catch(startCurrencies): " + e);
            })
    })
}

function setCurrencies(data) {
    console.log('setCurrencies' + new Date)
    let query = `INSERT INTO NBU (name, price, currency ,update_date)  VALUES (\'${data.name}\', \'${data.price}\', \'${data.currency}\', \'${data.update_date}\')`
    logger.appLogger.info(query)

    return new Promise(resolve => {
        connection.query(query,
            resolve(function (err, results, fields) {
                logger.errLogger.error(err + ' query');
                logger.appLogger.info(results);
                logger.appLogger.info(fields);
                return results
            }))
    })
}

function httpGet(url) {
    return new Promise(function (resolve, reject) {
        https.get(url, (res) => {
            res.setEncoding('utf8')
            res.on('data', function (chunk) {
                let result = JSON.parse(chunk)[0]
                logger.appLogger.info(result)
                resolve({
                    name: result.txt,
                    price: result.rate,
                    currency: result.cc,
                    update_date: result.exchangedate
                })
            })
            res.on('error', function (err) {
                logger.errLogger.error("currenciesUrl (on.error): " + err);
            })
        })
    });

}

function formatDate(date) {

    var dd = date.getDate();
    if (dd < 10) dd = '0' + dd;

    var mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;

    var yy = date.getFullYear();
    if (yy < 10) yy = '0' + yy;

    return `${yy}${mm}${dd}`;
}
