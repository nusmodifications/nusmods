export default handler => async (req, res) => {
  try {
    await handler(req, res)
  } catch (err) {
    return res.status(500).json({
      message: 'An unexpected error occurred'
    })
  }
}
