import { createLoginURL } from '../../auth'
import rescue from '../../utils/rescue'

const ssoHandler = async (req, res) => {
  try {
    let ssoLoginURL = new URL(createLoginURL())
    if (req.headers.origin) {
      ssoLoginURL.searchParams.append('RelayState', req.headers.origin)
    }
    res.redirect(ssoLoginURL.toString())
  } catch (err) {
    throw err
  }
}

export default rescue(ssoHandler)