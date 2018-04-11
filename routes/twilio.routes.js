const express = require('express');
const TwilioController = require('../controllers/mongo/twilio.mongo.controller');

const router = express.Router();

router.route('/twilio/token')
  .get(TwilioController.token);

router.route('/twilio/voice')
  .post(TwilioController.voice);

module.exports = router;
