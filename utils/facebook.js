const helpers = require('./helpers');
const Promise = require('bluebird');
const request = require('superagent');
const SocialModel = require('../models/mongo/SocialDataModel');
var mongoose = require('mongoose'),
SocialLogin=mongoose.model('SocialLogin');
Users=mongoose.model('Users');
module.exports.getMe = accessToken => new Promise((resolve, reject) => {
  // Sample Fields:
  // fields: 'id,email,first_name,last_name,name,about,age_range,birthday,gender,location,is_verified,timezone'
  request
    .get('https://graph.facebook.com/v2.11/me')
    .query({
      access_token: accessToken,
      fields: 'id,email,first_name,last_name,name,cover,age_range,link,gender,locale,picture,timezone,updated_time,verified'
    })
    .end((apiErr, apiRes) => {
      if (apiErr) return reject(apiErr);
      return resolve(JSON.parse(apiRes.text));
    });
});

module.exports.getProfile = (accessToken, userId) => new Promise((resolve, reject) => {
  request
    .get(`https://graph.facebook.com/v2.11/${userId}`)
    .query({
      access_token: accessToken
    })
    .end((apiErr, apiRes) => {
      if (apiErr) return reject(apiErr);
      return resolve(JSON.parse(apiRes.text));
    });
});

module.exports.getLikes = (accessToken, userId) => new Promise((resolve, reject) => {
  request
    .get(`https://graph.facebook.com/v2.11/${userId}/likes`)
    .query({
      access_token: accessToken
    })
    .end((apiErr, apiRes) => {
      if (apiErr) return reject(apiErr);
      return resolve(JSON.parse(apiRes.text));
    });
});

module.exports.saveFbData = helpers.async(function* (userId, fbUser) {
  const existingData = yield SocialLogin.findOne({
    'userId':userId,
    'type': types.facebook
    }
  );

  const saveData = {
    userId:userId,
    type: types.facebook
  };

  if (fbUser.age_range) {
    saveData.age = JSON.stringify(fbUser.age_range);
  }
  if (fbUser.cover && fbUser.cover.source) {
    saveData.coverPhoto = fbUser.cover.source;
  }
  if (fbUser.first_name) {
    saveData.firstName = fbUser.first_name;
  }
  if (fbUser.last_name) {
    saveData.lastName = fbUser.last_name;
  }
  if (fbUser.gender) {
    saveData.gender = fbUser.gender;
  }
  if (fbUser.link) {
    saveData.link = fbUser.link;
  }
  if (fbUser.locale) {
    saveData.locale = fbUser.locale;
  }
  if (fbUser.picture && fbUser.picture.data && fbUser.picture.data.url) {
    saveData.profilePicture = fbUser.picture.data.url;
  }
  if (fbUser.timezone) {
    saveData.timezone = fbUser.timezone;
  }
  if (fbUser.verified) {
    saveData.verified = fbUser.verified;
  }
  if (fbUser.updated_time) {
    saveData.lastUpdate = fbUser.updated_time;
  }

  if (Object.keys(fbUser).length < 1) {
    return 'No data passed';
  }

  if (existingData && existingData.userId && existingData.type) {
    return existingData.update(saveData);
  }
  new_task = new SocialLogin(saveData);
  var check = yield new_task.save().then(function(res){
      return true;
  });
  return check;
});
var types = {
    manual: 0,
    facebook: 1,
    linkedin: 2,
    twitter: 3,
  };
