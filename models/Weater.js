const Telegraf = require('telegraf')
const fs = require('fs')
const env = JSON.parse(fs.readFileSync('.env', 'utf8'))
const bot = new Telegraf(env.botToken)
const logger = require('../logs')
// const https = require('https')
const http = require('http')
const mysql = require('mysql2')
let connection = mysql.createConnection({
    host: env.databaseSql.host,
    user: env.databaseSql.user,
    database: "bot_info",
    password: env.databaseSql.password,
    port: env.databaseSql.port
});

let city = "Zaporizhzhya,%20UA"
let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=f025da743193e6d3a8af87677975d1e9&units=metric&lang=ru`

let lviv = `http://api.openweathermap.org/data/2.5/weather?q=Lviv,%20UA&appid=f025da743193e6d3a8af87677975d1e9&units=metric&lang=ru`
databaseStart()

module.exports.startWeather = function (weather_url, id) {
    let text = 'fail'
    let db = mysql.createConnection({
        host: env.databaseSql.host,
        user: env.databaseSql.user,
        database: "bot_info",
        password: env.databaseSql.password,
        port: env.databaseSql.port
    });
    db.connect(function (err) {
        if (err) {
            logger.errLogger.error("Ошибка (databaseStart): " + err.message);
        }
        else {
            logger.appLogger.info("Подключение к серверу MySQL успешно установлено");
        }
    })
    return new Promise(resolve => {
        http.get(weather_url, (res) => {
            res.setEncoding('utf8')
            res.on('data', function (chunk) {
                let result = JSON.parse(chunk)
                let day = dayOfWeekRus()
                let sun = (timestamp) => { let date = new Date(timestamp); return `${date.getHours()}:${date.getMinutes()}` }
                let msg = `В ${result.name} ${result.main.temp}°C\n${result.wind.speed}м/с, влажность ${result.main.humidity}%\nСейчас ${result['weather']['0']['description']} (${result.clouds.all}%)\nВосход: ${sun(result.sys.sunrise * 1000)} Закат: ${sun(result.sys.sunset * 1000)}`
                logger.appLogger.info(result)
                logger.appLogger.info(msg)
                // bot.telegram.sendMessage(id, msg)
                text = msg
                let temp = setWeather({
                    city: result.name,
                    description: result['weather']['0']['description'],
                    temp: result.main.temp,
                    day: day ? day : null,
                    speed: result.wind.speed,
                    pressure: result.main.pressure,
                    humidity: result.main.humidity,
                    temp_min: result.main.temp_min,
                    temp_max: result.main.temp_max,
                    wind_deg: result.wind.deg,
                    clouds_percent: result.clouds.all,
                    sunrise: result.sys.sunrise,
                    sunset: result.sys.sunset,
                }, db)
                temp = db.end(function (err) {
                    if (err) {
                        logger.errLogger.error("Ошибка (databaseEnd): " + err.message);
                    }
                    logger.appLogger.info("Подключение закрыто");
                });
                resolve(text)
            })
        })
    })
}

module.exports.getThisDayWeather = function (day_start, day_end, city) {
    let query = `SELECT * FROM weather WHERE create_date >= '${day_start}' AND create_date <= '${day_end}' AND city = '${city}'`
    let db = mysql.createConnection({
        host: env.databaseSql.host,
        user: env.databaseSql.user,
        database: "bot_info",
        password: env.databaseSql.password,
        port: env.databaseSql.port
    });
    db.connect(function (err) {
        if (err) {
            logger.errLogger.error("Ошибка (databaseStart): " + err.message);
        }
        else {
            logger.appLogger.info("Подключение к серверу MySQL успешно установлено");
        }
    })
    logger.appLogger.info(query)
    return new Promise(resolve => {
        let db_end = new Promise(db_end_res => {
            db.query(query,
                function (err, results, fields) {
                    logger.errLogger.error(err);
                    db_end_res(results)
                });
        })
        db_end.then(val => {
            temp = db.end(function (err) {
                if (err) {
                    logger.errLogger.error("Ошибка (databaseEnd): " + err.message);
                }
                logger.appLogger.info("Подключение закрыто");
            });
            resolve(val)
            return val
        })

    })

}

module.exports.getStringDate = function (date) {
    let month = addZero(date.getMonth() + 1)
    let hours = addZero(date.getHours())
    let minute = addZero(date.getMinutes())
    let seconds = addZero(date.getSeconds())
    function addZero(num) {
        if (num < 10) {
            num = `0${num}`
        }
        return num
    }
    return `${date.getFullYear()}-${month}-${date.getDate()} ${hours}:${minute}:${seconds}`
}

module.exports.getAvgTemp = function (arr) {
    let count = 0
    let i = 0
    if (!arr && !Array.isArray(arr)) {
        return false
    }
    arr.forEach(element => {
        count += parseFloat(element.temp)
        i++
    });
    return count / i
}

function databaseStart() {
    connection.connect(function (err) {
        if (err) {
            logger.errLogger.error("Ошибка (databaseStart): " + err.message);
        }
        else {
            logger.appLogger.info("Подключение к серверу MySQL успешно установлено");
        }
    })
}

function setWeather(data, connection) {
    let query = `INSERT INTO weather (city, description, temp, dow, wind_speed, pressure, humidity, temp_min, temp_max, wind_deg, clouds_percent, sunrise, sunset) VALUES (\'${data.city}\', \'${data.description}\', \'${data.temp}\', \'${data.day}\', \'${data.speed}\', \'${data.pressure}\', \'${data.humidity}\', \'${data.temp_min}\', \'${data.temp_max}\', \'${data.wind_deg}\', \'${data.clouds_percent}\', \'${data.sunrise}\', \'${data.sunset}\')`
    logger.appLogger.info(query)
    connection.query(query,
        function (err, results, fields) {
            logger.errLogger.error(err);
            logger.appLogger.info(results);
            logger.appLogger.info(fields);
        });
}

function databaseEnd() {
    connection.end(function (err) {
        if (err) {
            logger.errLogger.error("Ошибка (databaseEnd): " + err.message);
        }
        logger.appLogger.info("Подключение закрыто");
    });
}

function dayOfWeekRus(day = new Date()) {
    if (!day instanceof Date) {
        return false
    }
    switch (String(day.getDay())) {
        case "1":
            return 'Понедельник';
            break;
        case "2":
            return 'Вторник';
            break;
        case "3":
            return 'Среда';
            break;
        case "4":
            return 'Четверг';
            break;
        case "5":
            return 'Пятница';
            break;
        case "6":
            return 'Суббота';
            break;
        case "0":
            return 'Воскресенье';
            break;
        default:
            return false;
    }
}
