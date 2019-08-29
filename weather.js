const Telegraf = require('telegraf')
const fs = require('fs')
const env = JSON.parse(fs.readFileSync('./.env', 'utf8'))
const bot = new Telegraf(env.botToken)
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

let city = "Zaporizhzhya,%20UA"
let weather_url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=f025da743193e6d3a8af87677975d1e9&units=metric&lang=ru`

http.get(weather_url, (res) => {
    res.setEncoding('utf8')
    res.on('data', function (chunk) {
        let result = JSON.parse(chunk)
        let day = dayOfWeekRus()
        let msg = `В ${result.name} ${result.main.temp}°C\nс-в: ${result.wind.speed}м/с, влажность ${result.main.humidity}%\nСейчас ${result['weather']['0']['description']}`
        logger.appLogger.info(msg)
        bot.telegram.sendMessage(env.id.my, msg)
        databaseStart()
        setWeather({
            city: result.name,
            description: result['weather']['0']['description'],
            temp: result.main.temp,
            day: day ? day : '8',
            speed: result.wind.speed
        })
        databaseEnd()
    })
})

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
    let query = `INSERT INTO weather (city, description, temp, dow, wind_speed) VALUES (\'${data.city}\', \'${data.description}\', \'${data.temp}\', \'${data.day}\', \'${data.speed}\')`
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
    if (! day instanceof Date){
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

// bot.start((ctx) => {
//     console.log('Id пользователя:', ctx.from.id);
//     return ctx.reply('Добро пожаловать!');
// })

// bot.hears('Hi', ctx => {
//     console.log('Id пользователя:', ctx.from.id)
//     return ctx.reply('Hey!')
// })

// logger.appLogger.info('Start')

// try {
//     bot.telegram.sendMessage(env.id.my, 'I ready')
// } catch (error) {
//     logger.errLogger.info(error)
// }

// bot.startPolling()