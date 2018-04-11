const express = require('express');
const UserController = require('../controllers/mongo/user.mongo.controller');
//const UserBioController = require('../controllers/mongo/userBio.mongo.controller');
//const UserSkillsController = require('../controllers/mongo/userSkills.mongo.controller');

const router = express.Router();

router.route('/user/verify')
  .post(UserController.verify);

/*
router.route('/user')
  .get(UserController.getAll);

router.route('/user/newsletter')
  .post(UserController.newsletter);

router.route('/user/bio')
  .get(UserBioController.getBio)
  .post(UserBioController.addUpdate);

router.route('/user/skill')
  .get(UserSkillsController.getSkills)
  .post(UserSkillsController.addSkill);

router.route('/user/skill/:skillId')
  .delete(UserSkillsController.deleteSkill);

router.route('/user/:id')
  .get(UserController.getOne);*/
module.exports = router;
