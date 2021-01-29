export default (allowedMethods) => async (req, res) => {
  try {
    const allowHeaderValue = Object.keys(allowedMethods).reduce(
      (acc, method) => `${acc}, ${method}`,
    );
    res.setHeader('Allow', allowHeaderValue);
    res.status(405).json({
      message: 'Method not allowed',
    });
  } catch (err) {
    throw err;
  }
};
