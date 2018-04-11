const encryptConfig = require('../config/config.encrypt');

// Tools
const helpers = require('./helpers');

// Libraries
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// SQL
const MongoModel = require('../models/mongo/mongo');
const MongoModel1=require('../models/mongo/schedule')
var mongoose = require('mongoose'),
  Users = mongoose.model('Users');
  Schedule=mongoose.model('Schedule');
  mongoose.Promise = global.Promise;
  mongoose.connect('mongodb://localhost/UsersDB');
const tools = {
  decryptApiKey: helpers.async(function* (req, res, next) {
    try {
      const authorization = req.headers.authorization;

      if (!authorization || authorization === 'null') {
        req.currentUser = null;
        return next();
      }

      const decodedKey = yield jwt.verify(authorization, encryptConfig.secret);
      if (!decodedKey || !decodedKey.id || decodedKey.status !== 0) {
        req.currentUser = null;
        return next();
      }

      const userId = decodedKey.id;
      const user = yield Users.findOne({
          'id': userId
        })


      if (!user || !user.id || user.status !== 0) {
        req.currentUser = null;
        return next();
      }

      if (user.type === '5') {
        user.admin = true;
      }

      req.currentUser = user;
      return next();
    } catch (e) {
      console.error('decrypt API e:', e);
      req.currentUser = null;
      return next();
    }
  }),
  makeSalt: function makeSalt() {
    return Math.round( (new Date().valueOf() * Math.random())) + '';
  },
  saltPassword: (password) => {
    if (!password) {
      return {
        encrypt: '',
        salt: '',
      };
    }

    const salt = tools.makeSalt();

    const encrypted = crypto
      .createHmac('sha1', salt)
      .update(password)
      .digest('hex');

    return { encrypted, salt };
  },
  decryptPassword: (password, salt) => {
    if (!password || !salt) {
      return false;
    }

    const decrypted = crypto
      .createHmac('sha1', salt)
      .update(password)
      .digest('hex');

    return decrypted;
  },
  userCreate: helpers.async(function* (query) {
    console.log(query);
      var new_task = new Users(JSON.parse(query));
      debugger
        var check = yield new_task.save().then(function(res){
            return true;
        });

  }),
  userSchedule: helpers.async(function* (query) {
    console.log(query);
      var new_task = new Schedule(JSON.parse(query));
      debugger
        var check = yield new_task.save().then(function(res){
            return true;
        });

  }),



  userExists: helpers.async(function* (query) {
    const userCount = yield Users.count({'users.email':query.email});
    return userCount > 0;
  }),
};

module.exports = tools;
