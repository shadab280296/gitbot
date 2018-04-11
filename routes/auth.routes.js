const express = require('express');
const AuthController = require('../controllers/mongo/auth.mongo.controller');

const router = express.Router();

router.route('/auth/login')
  .post(AuthController.login);

router.route('/auth')
  .post(AuthController.signup);

router.route('/auth/signUpLogin')
  .post(AuthController.signUpOrLogin);

router.route('/auth/validate')
  .get(AuthController.validateKey);

module.exports = router;
