const dotenv = require('dotenv')
const commander = require('commander')
const express = require('express')
const RingCentral = require('ringcentral-js-concise')
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')

const pkg = require('./package.json')

dotenv.config()
const tokenFile = path.join(__dirname, '.token')
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
    return
  }
  const requestData = {
    eventFilters: [
      '/restapi/v1.0/glip/posts',
      '/restapi/v1.0/glip/groups',
      '/restapi/v1.0/subscription/~?threshold=60&interval=15'
    ],
    deliveryMode: {
      transportType: 'WebHook',
      address: `${process.env.GLIP_BOT_SERVER}/webhook`,
      verificationToken: 'xelXMLMhKDLVyViTy74d6CZ7Y7hJIqbS'
    },
    expiresIn: 86400 // 1 days
  }
  try {
    await rc.post('/restapi/v1.0/subscription', requestData)
  } catch (e) {
    console.error(e)
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
