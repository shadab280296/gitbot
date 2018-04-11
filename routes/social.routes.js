const express = require('express');
const SocialController = require('../controllers/mongo/social.mongo.controller');

const router = express.Router();

router.route('/social/facebookAuth')
  .post(SocialController.facebookAuth);
/*
router.route('/social/linkedInAuth')
  .post(SocialController.linkedInAuth);

router.route('/social/twitterRequest')
  .get(SocialController.twitterRequestToken);

router.route('/social/twitterAuth')
  .post(SocialController.twitterAccessToken);

router.route('/social')
  .get(SocialController.getSocialData);
*/
module.exports = router;
