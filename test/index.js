
const RingCentral = require('ringcentral-js-concise')
const fs = require('fs')
const path = require('path')

const token = JSON.parse(fs.readFileSync(path.join(__dirname, '../.token'), 'utf-8'))
const rc = new RingCentral('', '', 'https://platform.devtest.ringcentral.com')
rc.token(token)

rc.get('/restapi/v1.0/subscription').then(r => {
  console.log(JSON.stringify(r.data, null, 2))
}).catch(error => {
  console.log(error.response.data)
})
