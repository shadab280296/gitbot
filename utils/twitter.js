// https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/user-object
const helpers = require('./helpers');
const Promise = require('bluebird');
const Twitter = require('node-twitter-api');
//const SqlModel = require('../models/sql/sql');

let twitterObj;
const consumerKey = 'GPPciPxyPYwYjmJFjidAFI8uS';
const consumerSecret = 'RWZ3aeZzJwwcSW9xNJ7ACqtAClXGolhukT9WDKNnG6z9w43mvX';

module.exports.createTwitterObj = (req) => {
  if (twitterObj === undefined) {
    twitterObj = new Twitter({
      consumerKey,
      consumerSecret,
      callback: req.headers.referer
    });
  }
};

module.exports.requestToken = req => new Promise((resolve, reject) => {
  this.createTwitterObj(req);

  twitterObj.getRequestToken((err, requestToken, requestSecret) => {
    if (err) {
      return reject(err);
    }

    return resolve({ requestToken, requestSecret });
  });
});

module.exports.accessToken = (req, requestToken, verifier, requestSecret) => new Promise((resolve, reject) => {
  this.createTwitterObj(req);

  twitterObj.getAccessToken(requestToken, requestSecret, verifier, (err, accessToken, accessSecret) => {
    if (err) {
      return reject(err);
    }

    return resolve({ accessToken, accessSecret });
  });
});

module.exports.verifyCredentials = (req, accessToken, accessSecret) => new Promise((resolve, reject) => {
  this.createTwitterObj(req);

  const params = { include_email: true };
  twitterObj.verifyCredentials(accessToken, accessSecret, params, (err, user) => {
    if (err) {
      return reject(err);
    }

    return resolve(user);
  });
});

module.exports.saveTwData = helpers.async(function* (userId, twUser) {
  try {
    const existingData = yield SqlModel.SocialData.findOne({
      where: {
        userId,
        type: SqlModel.SocialData.types.twitter
      }
    });

    const saveData = {
      userId,
      type: SqlModel.SocialData.types.twitter
    };

    if (twUser.description) {
      saveData.bio = twUser.description;
    }
    if (twUser.profile_background_image_url_https) {
      saveData.coverPhoto = twUser.profile_background_image_url_https;
    }
    if (twUser.name) {
      if (twUser.name.split(' ').length > 0) {
        saveData.firstName = twUser.name.split(' ')[0];
      }
      if (twUser.name.split.length > 1) {
        saveData.lastName = twUser.name.split(' ')[1];
      }
    }
    if (twUser.screen_name) {
      saveData.link = `https://twitter.com/${twUser.screen_name}`;
    }
    if (twUser.url) {
      saveData.website = twUser.url;
    }
    if (twUser.lang) {
      saveData.locale = twUser.lang;
    }
    if (twUser.location) {
      saveData.location = twUser.location;
    }
    if (twUser.profile_image_url_https) {
      saveData.profilePicture = twUser.profile_image_url_https;
    }
    if (twUser.time_zone) {
      saveData.timezone = twUser.time_zone;
    }
    if (typeof twUser.verified !== 'undefined' && twUser.verified !== '') {
      saveData.verified = twUser.verified;
    }
    if (twUser.created_at) {
      saveData.firstCreated = new Date(twUser.created_at);
    }
    if (twUser.updated_time) {
      saveData.lastUpdate = twUser.updated_time;
    }

    if (Object.keys(twUser).length < 1) {
      return 'No data passed';
    }

    if (existingData && existingData.userId && existingData.type) {
      return existingData.update(saveData);
    }

    return SqlModel.SocialData.build(saveData).save();
  } catch (error) {
    console.error('save tw data:', error);
    return false;
  }
});
