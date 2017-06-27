const axios = require('axios')
const { createError } = require('micro-boom')

module.exports = config => handler => async (req, res) => {
  assert(config.issuer, 'Must provide OIDC provider url')
  const accessToken = req.headers.Authorization.replace('Bearer ', '')

  if (!accessToken || !accessToken.length) {
    throw createError(401, 'Must provide access token')
  }

  const { data: { active, sub: userId, scope } } = await axios({
    method: 'post',
    url: `${config.issuer}/token/introspection`,
    auth: {
      username: 'ui', // TODO, make client for this service
      password: '45DhKaGdB4MD6a6zrA8c'
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
