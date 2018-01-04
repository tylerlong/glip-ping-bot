import commander from 'commander'
import express from 'express'

import pkg from '../package.json'

commander.version(pkg.version)
  .option('-p --port <port>', 'Specify port')
  .parse(process.argv)

const port = commander.port || 3000

const app = express()
app.get('/oauth', function (req, res) {
  res.send('oauth')
})
app.post('/webhook', function (req, res) {
  res.set('validation-token', req.get('validation-token'))
  res.send('')
})
app.listen(port)
