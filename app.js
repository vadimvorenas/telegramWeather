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

logger.appLogger.info('Start')

try {
    bot.telegram.sendMessage(env.id.my, 'I ready')
} catch (error) {
    logger.appLogger.info(error)
}

bot.startPolling()