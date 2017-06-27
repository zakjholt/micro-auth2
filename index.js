const axios = require('axios')
const { createError } = require('micro-boom')

module.exports = config => handler => async (req, res) => {
  assert(config.introspectionUrl, 'Must provide token introspection URL')
  assert(config.clientId, 'Must provide clientId')
  assert(config.clientSecret, 'Must provide clientSecret')

  const { clientId, clientSecret, introspectionUrl } = config
  const accessToken = req.headers.Authorization.replace('Bearer ', '')

  if (!accessToken || !accessToken.length) {
    throw createError(401, 'Must provide access token')
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
    throw createError(403, 'Access token has expired or been revoked')
  }

  const newReq = Object.assign({}, req, { userData: { userId, scope } })

  return handler(newReq, res)
}
