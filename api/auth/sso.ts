import { createLoginURL } from '../../auth'
import rescue from '../../utils/rescue'

const ssoHandler = async (req, res) => {
  try {
    res.redirect(createLoginURL())
  } catch (err) {
    throw err
  }
}

export default rescue(ssoHandler)