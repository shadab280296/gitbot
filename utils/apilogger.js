/*eslint-disable*/
const url = require('url');
//const SqlModel = require('../models/sql/sql');

const apiLogger = {
  post: function (req, res, next) {
    const theDate = new Date();

    let query;
    if (isEmpty(req.body)) {
      query = JSON.stringify(url.parse(req.url, true).query);
    } else {
      const newObj = JSON.parse(JSON.stringify(req.body));;
      if (newObj.password) {
        delete newObj.password;
      }
      query = JSON.stringify(newObj);
    }

    /**
     * Check the request for a user and for the id. Unauthenticated
     * requests will often have an empty currentUser object, so
     * it's important to check the id
     */
    if (req.currentUser && req.currentUser != null && req.currentUser.id) {
      const userId = req.currentUser.id;

      SqlModel.APILog.build({
          userId,
          uri: req.path,
          ipAddress: req.headers['x-forwarded-for'] !== undefined ? req.headers['x-forwarded-for'] : req.connection.remoteAddress,
          misc: String(query),
      }).save();
    } else {
      SqlModel.APILog.build({
        uri: req.path,
        ipAddress: req.headers['x-forwarded-for'] !== undefined ? req.headers['x-forwarded-for'] : req.connection.remoteAddress,
        misc: String(query),
      }).save();
    }
    return next();
  },
};

function isEmpty(myObject) {
  for (let key in myObject) {
    if (myObject.hasOwnProperty(key)) {
      return false;
    }
  }

  return true;
}

module.exports = apiLogger;
