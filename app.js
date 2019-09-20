const Telegraf = require('telegraf')
const fs = require('fs')
const env = JSON.parse(fs.readFileSync('./.env', 'utf8'))
const bot = new Telegraf(env.botToken)
const logger = require('./logs')
const Weather = require('./models/Weater')

bot.start((ctx) => {
    console.log('Id пользователя:', ctx.from.id);
    return ctx.reply('Добро пожаловать!');
})

bot.hears('Hi', ctx => {
    console.log('Id пользователя:', ctx.from.id)
    return ctx.reply('Hey!')
})
bot.command('refresh', (ctx) => {
    refresh(ctx)
})

bot.command('refresh@NekitVadBot', (ctx) => {
    refresh(ctx)
})

bot.command('averagetemp@NekitVadBot', (ctx) => {
    averageTemp(ctx)
})

bot.command('averagetemp', (ctx) => {
    averageTemp(ctx)
})

function refresh(ctx) {
    let city = "Zaporizhzhya,%20UA"
    if (ctx.chat.id == env.id.Lviv) {
        city = "Lviv,%20UA"
    }
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=f025da743193e6d3a8af87677975d1e9&units=metric&lang=ru`

    async function f1() {
        let text = await Weather.startWeather(url, ctx.from.id)
        ctx.reply(text)
    }
    f1()
}

function averageTemp(ctx) {
    let getThisDayWeather = Weather.getThisDayWeather
    let city = "Zaporizhzhya"
    let date_start = Weather.getStringDate(new Date(Date.now() - (1000 * 3600 * 24)))
    let date_end = Weather.getStringDate(new Date())
    if (ctx.chat.id == env.id.Lviv) {
        city = "Lviv"
    }

    async function f1() {
        try {
            let weather = await getThisDayWeather(date_start, date_end, city)
            let vag_temp = Number(Weather.getAvgTemp(weather))
            let text = `Средняя температура за сутки: ${parseFloat(vag_temp.toFixed(2))}°C`
            logger.appLogger.info(text)

            ctx.reply(text)
        } catch (e) {
            console.log(e)
        }
    }
    f1()
}


logger.appLogger.info('Start')

try {
    bot.telegram.sendMessage(env.id.my, 'I ready')
} catch (error) {
    logger.errLogger.info(error)
}

bot.startPolling()