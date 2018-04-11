const TaError = require('../utils/taerror'); // eslint-disable-line

module.exports = (req, res, next) => {
  if (req.currentUser !== null && req.currentUser && req.currentUser.id) {
    return next();
  }

  const paramErrors = new TaError(401);

  paramErrors.addPermError('Invalid Permission');
  return res.status(paramErrors.code).json(paramErrors);
};
