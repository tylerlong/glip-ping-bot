import RingCentral, { SERVER_PRODUCTION } from 'ringcentral-ts'
import Token from 'ringcentral-ts/Token'

import pkg from '../package.json'

const rc = new RingCentral({
  server: SERVER_PRODUCTION
})
rc.agents.push(`${pkg.name}/${pkg.version}`)

rc.tokenStore.save(new Token().fromCache({
  type: 'Bearer',
  accessToken: 'U0pDMDFQMDlQQVMwMHxBQUJaWk5GR2hNSHJSdEFhTzJVa3kyR1YxRm9FQlhJMTdwU3ZnQ0hHNW45MUdKaFVHVUhISVlMc2ZFeGRRUldoUW9oNF9QWWRPMEVYNENYQjd4dmJsWHJoVGhNUVFkTzE5WExyaXdkekxVcy1xcGQzTk84QmE0NTJLV0I3ajhWdzZqcFNfQ2w2djcwdlhkWER3Z29tVmN0dGFmalZkMWVkQmtiMHFDRHNURjQtTElON0dEVFBrZVkwMUwxRjdrS1pNT2d8UUFxQ2hnfE5CZ0dkYWtON0g3ZlgtdHlMbnFwZXc'
})).then(() => {
  rc.account().extension().get().then((r) => {
    console.log(r)
  })
})

export default rc
