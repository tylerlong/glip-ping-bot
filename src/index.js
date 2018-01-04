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
const tokenFile = path.join(__dirname, '..', '.token')
const rc = new RingCentral(
  process.env.GLIP_CLIENT_ID,
  process.env.GLIP_CLIENT_SECRET,
  process.env.GLIP_API_SERVER
)
if (fs.existsSync(tokenFile)) { // restore token
  rc.token(JSON.parse(fs.readFileSync(tokenFile, 'utf-8')))
}

const app = express()
app.use(bodyParser.json())
app.get('/oauth', async (req, res) => {
  try {
    await rc.authorize({ code: req.query.code, redirect_uri: `${process.env.GLIP_BOT_SERVER}/oauth` })
  } catch (e) {
    console.error(e.response.data)
  }
  fs.writeFileSync(tokenFile, JSON.stringify(rc.token())) // save token
  res.send('')
})
app.post('/webhook', async (req, res) => {
  const message = req.body.body
  if (message && message.type === 'TextMessage') {
    if (message.text === 'ping') {
      try {
        await rc.post('/restapi/v1.0/glip/posts', { groupId: message.groupId, text: 'pong' })
      } catch (e) {
        console.error(e.response.data)
      }
    }
  }
  res.set('validation-token', req.get('validation-token'))
  res.send('')
})

commander.version(pkg.version).option('-p --port <port>', 'Specify port').parse(process.argv)
app.listen(commander.port || 3000)
