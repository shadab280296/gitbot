const express = require('express');
const AdminController = require('../controllers/mongo/admin.mongo.controller');

const router = express.Router();

router.route('/admin/users')
  .get(AdminController.getUsers);

router.route('/admin/predictionLog')
  .get(AdminController.getPredictionLog);

router.route('/admin/socialData')
  .get(AdminController.getSocialData);

module.exports = router;
