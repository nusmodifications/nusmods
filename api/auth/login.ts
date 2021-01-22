import { authenticate } from '../../auth'
import rescue from '../../utils/rescue'
import handleMethodNotFound from '../../utils/methodNotFound'

const errors = {
  noRelayState: 'ERR_NO_RELAY_STATE'
}

const allowedMethods = {
  POST: 'POST'
}

const loginHandler = async (req, res) => {
  try {
    switch (req.method) {
      case allowedMethods.POST:
        await handlePost(req, res)
        break
      default:
        await handleDefault(req, res)
        break
    }
  } catch (err) {
    throw err
  }
}

const handlePost = async (req, res) => {
  try {
    const { token, relayState } = await authenticate(req)
    if (!relayState) {
      throw new Error(errors.noRelayState)
    }

    const userURL = new URL(relayState)
    userURL.searchParams.append('token', token)

    res.redirect(userURL.toString())
  } catch (err) {
    if (err.message === errors.noRelayState) {
      return res.json({
        message: 'Relay state not found in request'
      })
    }
    throw err
  }
}

const handleDefault = handleMethodNotFound(allowedMethods)

export default rescue(loginHandler)