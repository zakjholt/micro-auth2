<p align="center"><img src='./lock.png'></p>
<h2 align="center">Octane micro-auth middleware</h2>

This is the oauth 2.0 authentication middleware for Octane zeit micro-services. It checks for accessTokens and checks for the token's status and scope, and also makes the user's ID available inside of a req.userData object.

It expects access tokens to be provided in the Authorization header, prepended with 'Bearer'

## Installation
```sh
yarn add @octane/micro-auth
```

## Usage
```javascript
const auth = require('micro-auth')

module.exports = auth({issuer: '<ISSUER_URL>'})(async function(req, res) {
  return 'Hello World!'
})
```

## Composed with other micro plugins
```javascript
const auth = require('micro-auth')
const visualize = require('micro-visualize')
const cookieParse = require('micro-cookie')
const { compose } = require('lodash/fp')
const { send } = require('micro')

module.exports = compose(
  auth({issuer: '<ISSUER_URL>'}),
  visualize,
  cookieParse
)(async (req, res) => {
  const responseMessage = {
    message: 'Great! You have been authenticated!'
  }

  send(res, 200, responseMessage)
})
```