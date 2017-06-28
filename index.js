const axios = require('axios')
const { sendError } = require('micro')
const assert = require('assert')

const introspectToken = async ({ introspectionUrl, clientId, clientSecret, accessToken }) => {
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

  return { userId, scope }
}

module.exports = exports = (config) => (fn) => {
  const { introspectionUrl, clientId, clientSecret } = config

  if (!introspectionUrl || !clientId || !clientSecret) {
    throw Error('Must provide config with introspectionUrl, clientId, and clientSecret properties')
  }

  return async (req, res) => {
    const bearerToken = req.headers.authorization

    if (!bearerToken) {
      return sendError(req, res, { statusCode: 401, message: 'missing Authorization header' })
    }

    const accessToken = bearerToken.replace('Bearer ', '')

    const { userId, scope } = await introspectToken({ clientId, clientSecret, introspectionUrl, accessToken })

    const newReq = Object.assign({}, req, { userData: { userId, scope } })

    return fn(req, res)
  }
}
