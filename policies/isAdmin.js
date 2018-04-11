const TaError = require('../utils/taerror'); // eslint-disable-line
//const SqlModel = require('../models/sql/sql');

module.exports = (req, res, next) => {
  if (req.currentUser.type === SqlModel.User.type.admin) {
    return next();
  }

  const paramErrors = new TaError(401);
  paramErrors.addPermError('Invalid Admin Permission');
  return res.status(paramErrors.code).json(paramErrors);
};
