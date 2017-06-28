const querystring = require('querystring')
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
    data: querystring.stringify({
      token: accessToken
    })
  })

  if (!active) {
    throw Error('Access token has expired or been revoked')
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

    try {
      const userData = await introspectToken({ clientId, clientSecret, introspectionUrl, accessToken })

      const newReq = Object.assign({}, req, { userData })

      return fn(newReq, res)
    } catch (error) {
      return sendError(req, res, { statusCode: 403, status: 403, message: error })
    }
  }
}