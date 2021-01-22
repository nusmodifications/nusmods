import axios from 'axios'
import { mpe } from '../config'

const defaultHeaders = {
  'X-API-KEY': mpe.apiKey,
  'X-FileUpload-API': mpe.fileUploadApi,
  'X-APP-API': mpe.appApi
}

const defaultHttpConfig = {
  headers: defaultHeaders
}

export const getSubmissionById = async userId => {
  try {
    const endpoint = `${mpe.endpoint}/${userId}.json`
    const resp = await axios.get(endpoint, defaultHttpConfig)
    return resp.data
  } catch (err) {
    throw err
  }
}

export const createSubmission = async (userId, submission) => {
  try {
    const endpoint = `${mpe.endpoint}/${userId}.json`
    const resp = await axios.post(endpoint, submission, defaultHttpConfig)
    return resp.data
  } catch (err) {
    throw err
  }
}
