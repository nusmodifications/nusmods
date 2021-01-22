export const auth = {
  idpMetaData: process.env.IDP_METADATA,
  spMetaData: process.env.SP_METADATA,
  spCertificate: process.env.SP_CERT
}

export const mpe = {
  endpoint: process.env.MPE_ENDPOINT,
  apiKey: process.env.MPE_API_KEY,
  fileUploadApi: process.env.MPE_FILE_UPLOAD_API,
  appApi: process.env.MPE_APP_API
}