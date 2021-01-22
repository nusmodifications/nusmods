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
    const submission = await getSubmissionById(req.user.accountName)
    res.json(submission)
  } catch (err) {
    if (err.response.status === 404) {
      return res.status(404).json({
        message: 'No MPE preferences are found for requesting user'
      })
    }
    throw err
  }
}

const handlePost = async (req, res) => {
  try {
    await createSubmission(req.user.accountName, req.body)
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