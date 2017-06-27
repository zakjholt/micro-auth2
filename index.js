const axios = require('axios')
const { sendError } = require('micro')
const assert = require('assert')

module.exports = config => handler => async (req, res) => {
  assert(config.introspectionUrl, 'Must provide token introspection URL')
  assert(config.clientId, 'Must provide clientId')
  assert(config.clientSecret, 'Must provide clientSecret')
  const { clientId, clientSecret, introspectionUrl } = config

  if (!req.headers.authorization) {
    return sendError(req, res, {
      statusCode: 401,
      message: 'Must provide access token'
    })
  }

  const accessToken = req.headers.authorization.replace('Bearer ', '')

  if (!accessToken || !accessToken.length) {
    return sendError(req, res, {
      statusCode: 401,
      message: 'Must provide access token'
    })
  }

  const { data: { active, sub: userId, scope } } = await axios({
    method: 'post',
    url: introspectionUrl,
    auth: {
      username: clientId,
      password: clientSecret
    },
    data: {
      token: accessToken
    }
  })

  if (!active) {
    return sendError(req, res, {
      statusCode: 403,
      message: 'Access token has expired or been revoked'
    })
  }

  const newReq = Object.assign({}, req, { userData: { userId, scope } })

  return handler(newReq, res)
}
