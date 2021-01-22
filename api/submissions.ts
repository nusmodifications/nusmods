import { getSubmissionById, createSubmission } from '../mpe'
import rescue from '../utils/rescue'
import { verifyLogin } from '../auth'

const allowedMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT'
}

const submissionHandler = async (req, res) => {
  try {
    switch (req.method) {
      case allowedMethods.GET:
        await handleGet(req, res)
        break
      case allowedMethods.POST:
      case allowedMethods.PUT:
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

const handleGet = async (req, res) => {
  try {
    const submission = await getSubmissionById('lmao')
    res.json(submission)
  } catch (err) {
    // TODO: Identify error type and throw relevant error.
    throw err
  }
}

const handlePost = async (req, res) => {
  try {
    // TODO: Obtain and validate data from request.
    const data = { content: 'Nine' }
    await createSubmission('lmao', data)
    res.json({
      message: 'Your MPE preferences are successfully recorded'
    })
  } catch (err) {
    // TODO: Identify error type and throw relevant error.
    throw err
  }
}

const handleDefault = async (req, res) => {
  try {
    const allowHeaderValue =
      Object.keys(allowedMethods).reduce((acc, method) => `${acc}, ${method}`)
    res.setHeader('Allow', allowHeaderValue)
    res.status(405).json({
      message: 'Method not allowed'
    })
  } catch (err) {
    throw err
  }
}

export default rescue(verifyLogin(submissionHandler))