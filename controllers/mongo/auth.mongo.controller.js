const helpers = require('../../utils/helpers');
const tools = require('../../utils/tools');
const MongoModel = require('../../models/mongo/mongo');
const TaError = require('../../utils/taerror'); // eslint-disable-line
const validator = require('../../utils/validator');
const emailer = require('../../utils/email');
const encryptConfig = require('../../config/config.encrypt');
const crypto = require('crypto');
let PatrolMan = require('patrolman');
const jwt = require('jsonwebtoken');

PatrolMan = new PatrolMan(require('../../policies/config')); // eslint-disable-line
var mongoose = require('mongoose'),
  Users = mongoose.model('Users');
const AuthController = {
  signup: helpers.async(function* (req, res) {
    try {
      //console.log(req.body.users)
      const { email, password } = req.body.users;
      //console.log(typeof email)
      // Check validations
      const paramErrors = new TaError(400);
      if (!email || !validator.isValidEmail(email)) {
        paramErrors.addParamError('Invalid email');
      }

      if (!password || !validator.isValidPassword(password)) {
        paramErrors.addParamError('Invalid password');
      }

      if (paramErrors.isErrors()) {
        return res.status(paramErrors.code).json(paramErrors);
      }

      // Convert pass to hash & salt
      const { encrypted, salt } = yield tools.saltPassword(password);
      const emailHash = crypto.randomBytes(20).toString('hex');

      const exists = yield tools.userExists({email});
        console.log(exists);
      if (exists) {
        return res.status(400).json(new TaError(400).addParamError('Email is already registered.'));
      }

      var usr = "{\"users\":{\"id\":\"02\",\"email\":\""+email+"\",\"emailHash\":\""+emailHash+"\",\"password\":\""+encrypted+"\",\"salt\":\""+salt+"\",\"verified\":\"not\",\"type\":\"5\"}}";
      yield tools.userCreate(usr);
      const usrCheck = yield tools.userExists({email});
      debugger;
      if(usrCheck){
      const verifyOpts = {
        email,
        emailHash
      };
      emailer.verificationEmail(verifyOpts);
      debugger
      // Delete params that we don't want to return to the user.
      const _saveUser = JSON.parse(usr);
      delete _saveUser.users.password;
      delete _saveUser.users.salt;
      delete _saveUser.users.emailHash;

      if (_saveUser.users.type === '5') {
        _saveUser.admin = true;
      }

      return res.status(200).json({ success: true, apiKey: jwt.sign(_saveUser, encryptConfig.secret), user: _saveUser, newUser: true });
   }} catch (error) {
      console.error('Unable to register:', error);
      return res.status(500).json(new TaError(500).addServerError(error.message));
    }
  }),

  login: helpers.async(function* (req, res) {
    try {
      const { email, password } = req.body;

      // Check validations
      const paramErrors = new TaError(400);
      if (!email || !validator.isValidEmail(email)) {
        paramErrors.addParamError('Invalid email');
      }

      if (!password || !validator.isValidPassword(password)) {
        paramErrors.addParamError('Invalid password');
      }

      if (paramErrors.isErrors()) {
        return res.status(paramErrors.code).json(paramErrors);
      }
      debugger;
      // Look in database for user
      const retUser = yield Users.findOne({'users.email':email}, function(err, task) {
          if (err)
            res.send(err);
              return task;
      });
      // Check if valid user returned, return error if needed
      if (!retUser || !retUser.id) {
        return res.status(400).json(new TaError(400).addSQLError('Unable to find user.'));
      }

      // HASH and SALT password, compare to database password
      const decryptedPass = yield tools.decryptPassword(password, retUser.users.salt);
      if (decryptedPass !== retUser.users.password) {
        return res.status(401).json(new TaError(401).addServerError('Invalid email or password.'));
      }

      // Delete params that we don't want to return to the user.
      const _retUser = retUser.toJSON();
      delete _retUser.users.password;
      delete _retUser.users.salt;
      delete _retUser.users.emailHash;
      if (_retUser.users.type === '5') {
        _retUser.admin = true;
      }

      return res.status(200).json({ success: true, apiKey: jwt.sign(_retUser, encryptConfig.secret), user: _retUser, newUser: false });
    } catch (error) {
      console.error('Unable to login:', error);
      return res.status(500).json(new TaError(500).addServerError(error.message));
    }
  }),
  signUpOrLogin: helpers.async(function* (req, res) {
    try {
      const { email, password } = req.body;

      // Check validations
      const paramErrors = new TaError(400);
      if (!email || !validator.isValidEmail(email)) {
        paramErrors.addParamError('Invalid email');
      }

      if (!password || !validator.isValidPassword(password)) {
        paramErrors.addParamError('Invalid password');
      }

      if (paramErrors.isErrors()) {
        return res.status(paramErrors.code).json(paramErrors);
      }

      // Look in database for user
      const retUser = yield Users.findOne({'users.email':email}, function(err, task) {
          if (err)
            res.send(err);
              return task;
      });

      // Check if valid user returned, return error if needed
      if (!retUser || !retUser.id) {
        // Convert pass to hash & salt
        const { encrypted, salt } = yield tools.saltPassword(password);
        const emailHash = crypto.randomBytes(20).toString('hex');

        // Save to DB
        var usr = "{\"users\":{\"id\":\"02\",\"email\":\""+email+"\",\"emailHash\":\""+emailHash+"\",\"password\":\""+encrypted+"\",\"salt\":\""+salt+"\",\"verified\":\"not\",\"type\":\"5\"}}";
        yield tools.userCreate(usr);
        const usrCheck = yield tools.userExists({email});
        if(usrCheck){
        const verifyOpts = {
          email,
          emailHash
        };
        emailer.verificationEmail(verifyOpts);

        // Delete params that we don't want to return to the user.
        const _saveUser = JSON.parse(usr);
        delete _saveUser.users.password;
        delete _saveUser.users.salt;
        delete _saveUser.users.emailHash;

        if (_saveUser.users.type === '5') {
          _saveUser.admin = true;
        }

        return res.status(200).json({ success: true, apiKey: jwt.sign(_saveUser, encryptConfig.secret), user: _saveUser, newUser: true });
      }

      // HASH and SALT password, compare to database password


      // Delete params that we don't want to return to the user.
      const decryptedPass = yield tools.decryptPassword(password, retUser.users.salt);
      if (decryptedPass !== retUser.users.password) {
        return res.status(401).json(new TaError(401).addServerError('Invalid email or password.'));
      }

      // Delete params that we don't want to return to the user.
      const _retUser = retUser.toJSON();
      delete _retUser.users.password;
      delete _retUser.users.salt;
      delete _retUser.users.emailHash;
      if (_retUser.users.type === '5') {
        _retUser.admin = true;
      }

      return res.status(200).json({ success: true, apiKey: jwt.sign(_retUser, encryptConfig.secret), user: _retUser, newUser: false });
    }} catch (error) {
      console.error('Unable to login / register:', error);
      return res.status(500).json(new TaError().addServerError(error.message));
    }
  }),
  validateKey: helpers.async(function* (req, res) {
    try {
      const paramErrors = new TaError(400);
      if (!req.query.apiKey || req.query.apiKey === 'undefined' || !validator.isValidString(req.query.apiKey)) {
        paramErrors.addParamError('Invalid apiKey parameter');
      }
      if (paramErrors.isErrors()) return res.status(paramErrors.code).json(paramErrors);

      const isVerify = yield jwt.verify(req.query.apiKey, encryptConfig.secret);

      if (!isVerify || !isVerify.id || isVerify.status !== 0) {
        return res.status(400).addSQLError('Invalid API key');
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Unable to verify apiKey:', error);
      return res.status(500).json(new TaError(500).addServerError(error.message));
    }
  }),
};
var status = {
    enabled: 0,
    disabled: 1,
    deleted: 2,
  };

var type = {
    user: 0,
    provider: 1,
    investor: 2,
    newsletter: 3,
    admin: 5,
  };

module.exports = PatrolMan.patrol('auth', AuthController);
