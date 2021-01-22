import * as samlify from 'samlify'
import * as validator from '@authenio/samlify-node-xmllint'
import * as fs from 'fs'
import { auth } from '../config'

const samlifyErrors = {
  assertionExpired: 'ERR_SUBJECT_UNCONFIRMED'
}

const samlRespAttributes = {
  accountName: 'http://schemas.nus.edu.sg/ws/2015/07/identity/claims/SamAccountName',
  upn: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
  email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
}

samlify.setSchemaValidator(validator);

const idp = samlify.IdentityProvider({
  metadata: fs.readFileSync(auth.idpMetaData)
})

const sp = samlify.ServiceProvider({
  metadata: fs.readFileSync(auth.spMetaData),
  signingCert: fs.readFileSync(auth.spCertificate)
})

export const createLoginURL = () => {
  const { context } = sp.createLoginRequest(idp, 'redirect')
  return context
}

export const authenticate = async req => {
  try {
    const {
      samlContent,
      extract: { attributes } 
    } = await sp.parseLoginResponse(idp, 'post', req)

    const loginData = {
      token: samlContent
    }

    for (let attr of Object.keys(samlRespAttributes)) {
      loginData[attr] = attributes[samlRespAttributes[attr]]
    }
    
    return loginData
  } catch (err) {
    throw err
  }
}

export const verifyLogin = next => async (req, res) => {
  try {
    const loginData = await authenticate(req)
    req.user = { ...loginData }
    delete req.user.token
    return await next(req, res)
  } catch (err) {
    if (err === samlifyErrors.assertionExpired) {
      return res.status(401).json({
        message: 'Token has expired, please login again'
      })
    }
    throw err
  }
}