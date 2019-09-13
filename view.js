const fs = require('fs')
const env = JSON.parse(fs.readFileSync('./.env', 'utf8'))
const logger = require('./logs')
const Nbu = require('./models/Nbu')
const express = require('express')
let app = express()
let port = 80

app.set("view engine", "ejs");
if (env.status && env.status == 'dev') {
    port = env.dev.port
} else if (env.status && env.status == 'prod') {
    port = env.prod.port
}

app.use(express.static('public'))

app.get('/nbu', function (req, res) {
    // console.log(req.query.nbu)
    f1().then(r => {
        // console.log(r)
        res.send(r)
    }).catch(e => { console.log(e); res.send(e) })
})

app.get('/', function (req, res) {
    res.render('nbu')
})


async function f1() {
    res = await Nbu.getNbu()
    return res
}

app.listen(port, function () {
    console.log(`Running port: ${port}`)
})
