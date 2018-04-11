const express = require('express');
const AIController = require('../controllers/mongo/ai.mongo.controller');

const router = express.Router();

router.route('/ai/categories')
  .get(AIController.categories);

router.route('/ai/prediction')
  .get(AIController.prediction);

router.route('/ai/suggestion')
  .get(AIController.getSuggestions);

router.route('/ai/autocomplete')
  .get(AIController.autocomplete);

module.exports = router;
