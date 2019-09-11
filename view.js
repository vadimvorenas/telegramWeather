const fs = require('fs')
const env = JSON.parse(fs.readFileSync('./.env', 'utf8'))
const logger = require('./logs')
const Nbu = require('./models/Nbu')

let res = ''
f1()
async function f1() {
    res = await Nbu.getNbu()
}
console.log(res)





