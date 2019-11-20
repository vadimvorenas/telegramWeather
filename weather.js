const Telegraf = require('telegraf')
const fs = require('fs')
const env = JSON.parse(fs.readFileSync('./.env', 'utf8'))
const bot = new Telegraf(env.botToken)
const logger = require('./logs')
const https = require('https')
const http = require('http')
const mysql = require('mysql2')
const cron = require('node-cron')
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

startScriptWeather()
cron.schedule('0 * * * *', () => {
    startScriptWeather()
})

cron.schedule('0 0 * * *', () => {
    avg24HoursWeather()
})

function startScriptWeather() {
    startWeather(url, env.id.pogoda)
        .then((resolve) => {
            return startWeather(lviv, env.id.Lviv)
        })
        .then(resolve => {
            return
        })
}

function avg24HoursWeather() {
    let weather = require('./models/Weater')
    let connection_avg = mysql.createConnection({
        host: env.databaseSql.host,
        user: env.databaseSql.user,
        database: "bot_info",
        password: env.databaseSql.password,
        port: env.databaseSql.port
    });
    let city = "Zaporizhzhya"
    let date_start = weather.getStringDate(new Date(Date.now() - (1000 * 3600 * 24)))
    let date_end = weather.getStringDate(new Date())
    connection_avg.connect(function (err) {
        if (err) {
            logger.errLogger.error("Ошибка: " + err.message);
        }
        else {
            logger.appLogger.info("Подключение к серверу MySQL успешно установлено");
        }
    })
    let promise = new Promise(function (resolve, rej) {
        resolve(weather.getThisDayWeather(date_start, date_end, city))
    })
    promise.then(res => {
        let vag_temp = weather.getAvgTemp(res)
        let text = `Средняя температура за сутки: ${parseFloat(Number(vag_temp).toFixed(2))}°C`
        logger.appLogger.info(`vag_temp ${vag_temp}`)
        logger.appLogger.info(`text ${text}`)
        try {
            bot.telegram.sendMessage(env.id.pogoda, text)
        } catch (error) {
            logger.errLogger.info(error)
        }
    }).catch(err => { logger.errLogger.info(err) })
}

function startWeather(weather_url, id) {
    return new Promise((resolve, rej) => {
        http.get(weather_url, (res) => {
            res.setEncoding('utf8')
            res.on('data', function (chunk) {
                let result = JSON.parse(chunk)
                let day = dayOfWeekRus()
                let sun = (timestamp) => { let date = new Date(timestamp); return `${date.getHours()}:${date.getMinutes()}` }
                let msg = `В ${result.name} ${result.main.temp}°C\n${result.wind.speed}м/с, влажность ${result.main.humidity}%\nСейчас ${result['weather']['0']['description']} (${result.clouds.all}%)\nВосход: ${sun(result.sys.sunrise * 1000)} Закат: ${sun(result.sys.sunset * 1000)}`
                logger.appLogger.info(result)
                logger.appLogger.info(msg)
                bot.telegram.sendMessage(id, msg)
                let connection_set = mysql.createConnection({
                    host: env.databaseSql.host,
                    user: env.databaseSql.user,
                    database: "bot_info",
                    password: env.databaseSql.password,
                    port: env.databaseSql.port
                });
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
                }, connection_set)
                temp = connection_set.end(function (err) {
                    if (err) {
                        logger.errLogger.error("Ошибка (databaseEnd): " + err.message);
                    }
                    logger.appLogger.info("Подключение закрыто");
                });
                resolve(temp)
            })
            res.on('error', function (err) {
                logger.errLogger.error("startWeather: " + err);
            })
        })
    })
}

function setWeather(data, connection_set = {}) {
    let query = `INSERT INTO weather (city, description, temp, dow, wind_speed, pressure, humidity, temp_min, temp_max, wind_deg, clouds_percent, sunrise, sunset) VALUES (\'${data.city}\', \'${data.description}\', \'${data.temp}\', \'${data.day}\', \'${data.speed}\', \'${data.pressure}\', \'${data.humidity}\', \'${data.temp_min}\', \'${data.temp_max}\', \'${data.wind_deg}\', \'${data.clouds_percent}\', \'${data.sunrise}\', \'${data.sunset}\')`
    logger.appLogger.info('setWeather ' + query)
    return connection_set.query(query,
        function (err, results, fields) {
            logger.errLogger.error('setWeather - Erorr' + err);
            logger.appLogger.info(results);
            logger.appLogger.info(fields);
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
