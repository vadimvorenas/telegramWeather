const Telegraf = require('telegraf')
const fs = require('fs')
const env = JSON.parse(fs.readFileSync('./.env', 'utf8'))
const bot = new Telegraf(env.botToken)
const logger = require('./logs')

bot.start((ctx) => {
    console.log('Id пользователя:', ctx.from.id);
    return ctx.reply('Добро пожаловать!');
})

bot.hears('Hi', ctx => {
    console.log('Id пользователя:', ctx.from.id)
    return ctx.reply('Hey!')
})
bot.command('refresh', (ctx) => {
    let startWeather = require('./models/Weater')
    let city = "Zaporizhzhya,%20UA"
    if (ctx.from.id == env.id.Lviv){
        city = "Lviv,%20UA"
    }
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=f025da743193e6d3a8af87677975d1e9&units=metric&lang=ru`

    async function f1 (){
        let text = await startWeather(url, ctx.from.id)
        ctx.reply(text)
    }
    f1()
})

bot.command('refresh@NekitVadBot', (ctx) => {
    let startWeather = require('./models/Weater')
    let city = "Zaporizhzhya,%20UA"
    if (ctx.chat.id == env.id.Lviv){
        city = "Lviv,%20UA"
    }
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=f025da743193e6d3a8af87677975d1e9&units=metric&lang=ru`

    async function f1 (){
        let text = await startWeather(url, ctx.from.id)
        ctx.reply(text)
    }
    f1()
})

logger.appLogger.info('Start')

try {
    bot.telegram.sendMessage(env.id.my, 'I ready')
} catch (error) {
    logger.errLogger.info(error)
}

bot.startPolling()