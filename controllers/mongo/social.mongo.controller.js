const helpers = require('../../utils/helpers');
const TaError = require('../../utils/taerror'); // eslint-disable-line
const SocialModel = require('../../models/mongo/SocialDataModel');
const facebook = require('../../utils/facebook');
//const linkedIn = require('../../utils/linkedin');
//const twitter = require('../../utils/twitter');
const emailer = require('../../utils/email');
const crypto = require('crypto');
const encryptConfig = require('../../config/config.encrypt');
const jwt = require('jsonwebtoken');
var mongoose = require('mongoose'),
SocialLogin=mongoose.model('SocialLogin'),
Users=mongoose.model('Users');

let PatrolMan = require('patrolman');

PatrolMan = new PatrolMan(require('../../policies/config')); // eslint-disable-line

const SocialController = {
  facebookAuth: helpers.async(function* (req, res) {
    try {
      const reqObj = req.body;

      const paramErrors = new TaError(400);
      if (reqObj.accessToken === undefined || typeof reqObj.accessToken === 'undefined') {
        paramErrors.addParamError('Invalid Access Token');
      }

      if (paramErrors.isErrors()) {
        return res.status(paramErrors.code).json(paramErrors);
      }

      const fbUser = yield facebook.getMe(reqObj.accessToken);

      if (fbUser.email === undefined) {
        return res.status(400).json(new TaError(400).addParamError('Facebook account does not have email address.'));
      }

      let newUser = false;
      let sqlUser = yield SocialLogin.findOne({email: fbUser.email},function(err,data){
            if(err) return res.send(err);
            if(data==null) return null;
            return data;
      });

      if (!sqlUser || sqlUser.id === undefined) {
        newUser = true;
        const emailHash = crypto.randomBytes(20).toString('hex');
        var new_task = new Users({
          'users.email': fbUser.email,
          'users.emailHash':emailHash
        });
        var check = yield new_task.save().then(function(res){
              return true;
          });

        /*sqlUser = yield SqlModel.User.build({
          email: fbUser.email,
          emailHash
        }).save();*/
        if(check){
        const verifyOpts = {
          email: fbUser.email,
          emailHash
        };
        emailer.verificationEmail(verifyOpts);
      }
      }

      facebook.saveFbData(sqlUser.id, fbUser);

      // Look for type & user ID in socialLogin
      let socialLogin = yield SocialLogin.findOne({
          type: types.facebook,
          socialId: fbUser.id
        }
      );

      if (!socialLogin || socialLogin.id === undefined) {
        // If not in SQL already
        socialLogin = yield SocialLogin.build({
          userId: sqlUser.id,
          accessToken: reqObj.accessToken,
          signedRequest: reqObj.signedRequest,
          socialId: reqObj.userID,
          type: types.facebook
        }).save();
      } else {
        // Check if SQL userId === SOCIAL userId
        if (sqlUser.id !== socialLogin.userId) {
          return new TaError(400).addServerError('User ids do not match.');
        }

        // If in SQL, update
        socialLogin.accessToken = reqObj.accessToken;
        socialLogin.signedRequest = reqObj.signedRequest;
        socialLogin.save();
      }

      // Delete params that we don't want to return to the user.
      const _sqlUser = sqlUser.toJSON();
      delete _sqlUser.password;
      delete _sqlUser.salt;
      delete _sqlUser.emailHash;

      return res.status(200).json({ success: true, apiKey: jwt.sign(_sqlUser, encryptConfig.secret), user: _sqlUser, newUser });
}catch (error) {
      console.log('Unable to get complete Facebook Auth:'+error);
      return res.status(500).json(new TaError(500).addServerError(error));
    }
}),/*
  linkedInAuth: helpers.async(function* (req, res) {
    try {
      const reqObj = req.body;

      const paramErrors = new TaError(400);
      if (reqObj.oauth_token === undefined || typeof reqObj.oauth_token === 'undefined') {
        paramErrors.addParamError('Invalid Access Token');
      }

      if (paramErrors.isErrors()) {
        return res.status(paramErrors.code).json(paramErrors);
      }

      const inUser = yield linkedIn.getProfile(reqObj.oauth_token);

      if (inUser.emailAddress === undefined) {
        return res.status(400).json(new TaError(400).addParamError('LinkedIn account does not have email address.'));
      }

      let newUser = false;
      let sqlUser = yield SqlModel.User.findOne({
        where: {
          email: inUser.emailAddress
        }
      });

      if (!sqlUser || sqlUser.id === undefined) {
        newUser = true;
        const emailHash = crypto.randomBytes(20).toString('hex');
        sqlUser = yield SqlModel.User.build({
          email: inUser.emailAddress,
          emailHash
        }).save();

        const verifyOpts = {
          email: inUser.emailAddress,
          emailHash
        };
        emailer.verificationEmail(verifyOpts);
      }

      linkedIn.saveInData(sqlUser.id, inUser);

      // Look for type & user ID in socialLogin
      let socialLogin = yield SqlModel.SocialLogin.findOne({
        where: {
          type: SqlModel.SocialLogin.types.linkedin,
          socialId: inUser.id
        }
      });

      if (!socialLogin || socialLogin.id === undefined) {
        // If not in SQL already
        socialLogin = yield SqlModel.SocialLogin.build({
          userId: sqlUser.id,
          accessToken: reqObj.oauth_token,
          signedRequest: reqObj.anonymous_token,
          socialId: reqObj.member_id,
          type: SqlModel.SocialLogin.types.linkedin
        }).save();
      } else {
        // Check if SQL userId === SOCIAL userId
        if (sqlUser.id !== socialLogin.userId) {
          return new TaError(400).addServerError('User ids do not match.');
        }

        // If in SQL, update
        socialLogin.accessToken = reqObj.oauth_token;
        socialLogin.signedRequest = reqObj.anonymous_token;
        socialLogin.save();
      }

      // Delete params that we don't want to return to the user.
      const _sqlUser = sqlUser.toJSON();
      delete _sqlUser.password;
      delete _sqlUser.salt;
      delete _sqlUser.emailHash;

      return res.status(200).json({ success: true, apiKey: jwt.sign(_sqlUser, encryptConfig.secret), user: _sqlUser, newUser });
    } catch (error) {
      console.error('Unable to get complete LinkedIn Auth:', error);
      return res.status(500).json(new TaError(500).addServerError(error));
    }
  }),
  twitterRequestToken: helpers.async(function* (req, res) {
    try {
      const twitterRes = yield twitter.requestToken(req);

      if (!twitterRes.requestToken && !twitterRes.requestSecret) {
        return res.status(400).json(new TaError(400).addServerError('Unable to retrieve request token.'));
      }

      return res.status(200).json({ success: true, requestToken: twitterRes.requestToken, requestSecret: twitterRes.requestSecret });
    } catch (error) {
      console.error('Unable to get complete Twitter Request:', error);
      return res.status(500).json(new TaError(500).addServerError(error));
    }
  }),
  twitterAccessToken: helpers.async(function* (req, res) {
    try {
      const paramErrors = new TaError(400);
      const oauthVerifier = req.body.oauth_verifier;
      if (!oauthVerifier) {
        paramErrors.addParamError('Invalid parameter oauthVerifier');
      }
      const requestToken = req.body.requestToken;
      if (!requestToken) {
        paramErrors.addParamError('Invalid parameter requestToken');
      }
      const requestSecret = req.body.requestSecret;
      if (!requestSecret) {
        paramErrors.addParamError('Invalid parameter requestSecret');
      }
      if (paramErrors.isErrors()) {
        return res.status(paramErrors.code).json(paramErrors);
      }

      const twitterAPI = yield twitter.accessToken(req, requestToken, oauthVerifier, requestSecret);

      const accessToken = twitterAPI.accessToken;
      const accessSecret = twitterAPI.accessSecret;

      const twUser = yield twitter.verifyCredentials(req, accessToken, accessSecret);

      if (twUser.email === undefined) {
        return res.status(400).json(new TaError(400).addParamError('Twitter account does not have email address.'));
      }

      let newUser = false;
      let sqlUser = yield SqlModel.User.findOne({
        where: {
          email: twUser.email
        }
      });

      if (!sqlUser || sqlUser.id === undefined) {
        newUser = true;
        const emailHash = crypto.randomBytes(20).toString('hex');
        sqlUser = yield SqlModel.User.build({
          email: twUser.email,
          emailHash
        }).save();

        const verifyOpts = {
          email: twUser.email,
          emailHash
        };
        emailer.verificationEmail(verifyOpts);
      }

      twitter.saveTwData(sqlUser.id, twUser);

      // Look for type & user ID in socialLogin
      let socialLogin = yield SqlModel.SocialLogin.findOne({
        where: {
          type: SqlModel.SocialLogin.types.twitter,
          socialId: twUser.id
        }
      });

      if (!socialLogin || socialLogin.id === undefined) {
        // If not in SQL already
        socialLogin = yield SqlModel.SocialLogin.build({
          userId: sqlUser.id,
          accessToken,
          signedRequest: accessSecret,
          socialId: twUser.id,
          type: SqlModel.SocialLogin.types.twitter
        }).save();
      } else {
        // Check if SQL userId === SOCIAL userId
        if (sqlUser.id !== socialLogin.userId) {
          return new TaError(400).addServerError('User ids do not match.');
        }

        // If in SQL, update
        socialLogin.accessToken = accessToken;
        socialLogin.signedRequest = accessSecret;
        socialLogin.save();
      }

      // Delete params that we don't want to return to the user.
      const _sqlUser = sqlUser.toJSON();
      delete _sqlUser.password;
      delete _sqlUser.salt;
      delete _sqlUser.emailHash;

      return res.status(200).json({ success: true, apiKey: jwt.sign(_sqlUser, encryptConfig.secret), user: _sqlUser, newUser });
    } catch (error) {
      console.error('Unable to get complete Twitter Login:', error);
      return res.status(500).json(new TaError(500).addServerError(error));
    }
  }),
  getSocialData: helpers.async(function* (req, res) {
    try {
      const userId = req.currentUser.id;

      const socialDatas = yield SqlModel.SocialData.findAll({
        where: {
          userId
        }
      });

      if (!Array.isArray(socialDatas)) {
        return res.status(400).json(new TaError(400).addServerError('Unable to retrieve social data.'));
      }

      const retData = {};
      if (socialDatas.length > 0) {
        Object.keys(socialDatas).forEach((data) => {
          if (socialDatas[data].type === SqlModel.SocialData.types.facebook) {
            retData.facebook = socialDatas[data];
          } else if (socialDatas[data].type === SqlModel.SocialData.types.linkedin) {
            retData.linkedin = socialDatas[data];
          } else if (socialDatas[data].type === SqlModel.SocialData.types.twitter) {
            retData.twitter = socialDatas[data];
          }
        });
      }

      return res.status(200).json({ socialData: retData });
    } catch (error) {
      console.error('Unable to get get social data:', error);
      return res.status(500).json(new TaError(500).addServerError(error));
    }
  }),*/
};
var types={
    manual: 0,
    facebook: 1,
    linkedin: 2,
    twitter: 3,
  };
module.exports = PatrolMan.patrol('social', SocialController);
