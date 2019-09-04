const Telegraf = require('telegraf')
const fs = require('fs')
const env = JSON.parse(fs.readFileSync('.env', 'utf8'))
const bot = new Telegraf(env.botToken)
const logger = require('../logs')
// const https = require('https')
const http = require('http')
const mysql = require('mysql2')
const connection = mysql.createConnection({
    host: env.databaseSql.host,
    user: env.databaseSql.user,
    database: "bot_info",
    password: env.databaseSql.password,
    port: env.databaseSql.port
});

let city = "Zaporizhzhya,%20UA"
let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=f025da743193e6d3a8af87677975d1e9&units=metric&lang=ru`

let lviv = `http://api.openweathermap.org/data/2.5/weather?q=Lviv,%20UA&appid=f025da743193e6d3a8af87677975d1e9&units=metric&lang=ru`

// let promise = new Promise(function (resolve, reject) {
//     resolve(startWeather(url, env.id.pogoda))
// })
// promise.then((resolve) => {
//     startWeather(lviv, env.id.Lviv)
// })

module.exports = function (weather_url, id) {
    let text = 'fail'
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
                databaseStart()
                setWeather({
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
                })
                databaseEnd()
                resolve(text)
            })
        })
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

function setWeather(data) {
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
            logger.errLogger.error("Ошибка: " + err.message);
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
