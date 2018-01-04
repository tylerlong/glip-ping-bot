import 'babel-polyfill'
import dotenv from 'dotenv'
import commander from 'commander'
import express from 'express'
import RingCentral from 'ringcentral-js-concise'
import fs from 'fs'
import path from 'path'
import bodyParser from 'body-parser'

import pkg from '../package.json'

dotenv.config()

const rc = new RingCentral(
  process.env.GLIP_CLIENT_ID,
  process.env.GLIP_CLIENT_SECRET,
  process.env.GLIP_API_SERVER
)

const tokenFile = path.join(__dirname, '..', '.token')
if (fs.existsSync(tokenFile)) { // restore token
  rc.token(JSON.parse(fs.readFileSync(tokenFile, 'utf-8')))
}

commander.version(pkg.version)
  .option('-p --port <port>', 'Specify port')
  .parse(process.argv)

const port = commander.port || 3000

const app = express()
app.use(bodyParser.json())
app.get('/oauth', async (req, res) => {
  try {
    await rc.authorize({ code: req.query.code, redirect_uri: `${process.env.GLIP_BOT_SERVER}/oauth` })
    fs.writeFileSync(tokenFile, JSON.stringify(rc.token())) // save token
    res.status(200)
    res.send('')
  } catch (e) {
    res.status(500)
    res.send(e.message)
  }
})
app.post('/webhook', (req, res) => {
  res.set('validation-token', req.get('validation-token'))
  res.send('')
  console.log(req.body)
  const message = req.body.body
  if (message.type === 'TextMessage') {
    if (message.text === 'ping') {
      rc.post('/restapi/v1.0/glip/posts', { groupId: message.groupId, text: 'pong' })
    }
  }
})
app.listen(port)
