// https://developer.linkedin.com/docs/fields/basic-profile
const helpers = require('./helpers');
const Promise = require('bluebird');
const request = require('superagent');
//const SqlModel = require('../models/sql/sql');

module.exports.getProfile = accessToken => new Promise((resolve, reject) => {
  const fields = 'id,first-name,last-name,headline,location,industry,summary,specialties,positions,picture-url,public-profile-url,siteStandardProfileRequest,email-address';
  request
    .get(`https://api.linkedin.com/v1/people/~:(${fields})`)
    .query({
      format: 'json'
    })
    .set({
      'Content-Type': 'application/json',
      oauth_token: accessToken
    })
    .end((apiErr, apiRes) => {
      if (apiErr) return reject(apiErr);
      return resolve(apiRes.body);
    });
});

module.exports.saveInData = helpers.async(function* (userId, inUser) {
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

    if (inUser.firstName) {
      saveData.firstName = inUser.firstName;
    }
    if (inUser.lastName) {
      saveData.lastName = inUser.lastName;
    }
    if (inUser.publicProfileUrl) {
      saveData.profilePicture = inUser.publicProfileUrl;
    }
    if (inUser.siteStandardProfileRequest && inUser.siteStandardProfileRequest.url) {
      saveData.link = inUser.siteStandardProfileRequest.url;
    }
    if (inUser.summary) {
      saveData.bio = inUser.summary;
    }

    if (Object.keys(inUser).length < 1) {
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

// industry
// positions.values[0].company.name
// positions.values[0].company.size
// positions.values[0].location
// positions.values[0].startDate (stringify)
// positions.values[0].isCurrent
// positions.values[0].title
