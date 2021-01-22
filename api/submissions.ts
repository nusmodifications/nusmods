import { getSubmissionById, createSubmission } from '../mpe'
import { verifyLogin } from '../auth'
import rescue from '../utils/rescue'
import handleMethodNotFound from '../utils/methodNotFound'

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

const handleDefault = handleMethodNotFound(allowedMethods)

export default rescue(verifyLogin(submissionHandler))